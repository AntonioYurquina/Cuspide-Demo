/**
 * La agenda del día: la portada del sistema.
 *
 * Es lo primero que mira una secretaria al abrir la persiana, así que es lo primero que tiene
 * que verse bien. Muestra lo que se necesita de un vistazo —quién viene, a qué hora, con quién,
 * a qué— y lo que hay que resolver: los que faltan confirmar y los que deben.
 */

import { contar, may, useEspecialidad } from '../especialidades/index.ts';
import {
  RECURSOS,
  ESTADOS_TURNO,
  HOY,
  PROFESIONALES,
  TURNOS,
  fechaCorta,
  fechaLarga,
  hora,
  mismoDia,
  pacienteDe,
  pesos,
  profesionalDe,
  type EstadoTurno,
} from '../datos/consultorio.ts';
import { Tarjeta } from '../components/ui.tsx';
import { comoTurnos, usePedidos } from '../publico/pedidos.ts';

const CLASE_ESTADO: Record<EstadoTurno, string> = {
  confirmado: 'bg-tinta-50 text-tinta-700 border-tinta-200',
  enSala: 'bg-ambar-50 text-ambar-700 border-ambar-100',
  atendido: 'bg-marca-50 text-marca-800 border-marca-100',
  ausente: 'bg-rojo-50 text-rojo-800 border-rojo-100',
  aConfirmar: 'bg-gris-100 text-gris-700 border-gris-300',
  pedido: 'bg-purpura-50 text-purpura-800 border-purpura-200',
};

export function PaginaAgenda() {
  const { e } = useEspecialidad();

  /*
   * Los turnos de hoy incluyen **los que pidió un paciente desde el sitio**, que entran solos y
   * sin que nadie los copie a mano. Es el argumento de `HU-010` y no se cuenta: se pide uno en
   * `/turnos-online` y aparece acá, con su propio estado para que se vea de dónde salió.
   */
  const todosLosPedidos = comoTurnos(usePedidos());
  const pedidos = todosLosPedidos.filter((t) => mismoDia(t.inicio, HOY));
  /**
   * Los pedidos de otros días, que son **casi todos**.
   *
   * Esta pantalla muestra el día de hoy, y el sitio sólo puede ofrecer franjas que todavía no
   * pasaron: a partir de media tarde no queda ninguna de hoy, así que el primer turno que pide
   * alguien cae mañana. Con el filtro de «hoy» a secas, **el pedido no aparecía en ninguna
   * pantalla del sistema** mientras la confirmación le decía al paciente «tu turno ya está en la
   * agenda del centro». Era mentira la mitad del día y el 100 % de las veces a esta hora.
   */
  const proximos = todosLosPedidos
    .filter((t) => !mismoDia(t.inicio, HOY))
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

  const deHoy = [...TURNOS.filter((t) => mismoDia(t.inicio, HOY)), ...pedidos].sort(
    (a, b) => a.inicio.getTime() - b.inicio.getTime(),
  );

  const atendidos = deHoy.filter((t) => t.estado === 'atendido').length;
  const enSala = deHoy.filter((t) => t.estado === 'enSala').length;
  // Los pedidos del sitio **cuentan**: están esperando que alguien del centro los mire, que es
  // exactamente lo que este indicador dice.
  const porConfirmar =
    TURNOS.filter((t) => t.estado === 'aConfirmar' && t.inicio > HOY).length +
    todosLosPedidos.filter((t) => t.inicio > HOY).length;
  // Sólo los turnos con paciente cargado: quien pidió desde el sitio todavía no tiene ficha, así
  // que no tiene deuda que mirar.
  const conDeuda = new Set(
    deHoy
      // `flatMap` y no `filter` + `map`: adentro del callback el compilador sabe cuál es cuál,
      // así que no hace falta afirmarle nada.
      .flatMap((t) => ('nombreLibre' in t ? [] : [pacienteDe(t.pacienteId)]))
      .filter((p) => p.deuda > 0)
      .map((p) => p.id),
  ).size;
  const facturadoHoy = deHoy
    .filter((t) => t.estado === 'atendido')
    .reduce((suma, t) => suma + 18_000 + ((t.id.length * 7_300) % 42_000), 0);

  const kpis = [
    {
      etiqueta: 'Turnos de hoy',
      valor: String(deHoy.length),
      detalle: `${atendidos} atendidos · ${enSala} en sala`,
    },
    {
      etiqueta: 'Por confirmar',
      valor: String(porConfirmar),
      detalle: 'en los próximos días',
      alerta: porConfirmar > 0,
    },
    {
      etiqueta: 'Pacientes con deuda',
      valor: String(conDeuda),
      detalle: 'entre los de hoy',
      alerta: conDeuda > 0,
    },
    { etiqueta: 'Facturado hoy', valor: pesos(facturadoHoy), detalle: 'sobre turnos atendidos' },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-.025em] text-gris-900">Agenda del día</h1>
        <p className="mt-1 text-sm text-gris-600 first-letter:uppercase">{fechaLarga(HOY)}</p>
      </header>

      {proximos.length > 0 && (
        <Tarjeta className="mb-6 border-purpura-600 p-4">
          <p className="text-sm font-semibold text-purpura-800">
            {proximos.length === 1
              ? 'Un turno pedido desde el sitio, para otro día'
              : `${proximos.length} turnos pedidos desde el sitio, para otros días`}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gris-700">
            {proximos.slice(0, 5).map((t) => (
              <li key={t.id} className="flex flex-wrap items-baseline gap-x-2">
                <span className="tabular text-gris-600">
                  {fechaCorta(t.inicio)} {hora(t.inicio)}
                </span>
                <span className="font-medium text-gris-900">{t.nombreLibre}</span>
                <span className="text-gris-600">
                  · {profesionalDe(t.profesionalId).nombre}
                  {t.sena > 0 && ` · seña ${pesos(t.sena)}`}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gris-600">
            Entraron solos, sin que nadie los copie a mano. Quedan pendientes de confirmar.
          </p>
        </Tarjeta>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Tarjeta key={k.etiqueta} className={`p-4 ${k.alerta ? 'border-ambar-600' : ''}`}>
            <p className="text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">
              {k.etiqueta}
            </p>
            <p className="tabular mt-1.5 text-[28px] leading-none font-bold text-gris-900">
              {k.valor}
            </p>
            <p className={`mt-1.5 text-xs ${k.alerta ? 'text-ambar-700' : 'text-gris-600'}`}>
              {k.detalle}
            </p>
          </Tarjeta>
        ))}
      </div>

      <Tarjeta className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-gris-200 bg-gris-50 text-left text-xs font-semibold text-gris-600">
            <tr>
              <th className="px-3 py-2.5">Hora</th>
              <th className="px-3 py-2.5">Paciente</th>
              <th className="px-3 py-2.5">Obra social</th>
              <th className="px-3 py-2.5">{may(e.profesional.singular)}</th>
              <th className="px-3 py-2.5">{may(e.recurso.singular)}</th>
              <th className="px-3 py-2.5">{may(e.unidad.singular)}</th>
              <th className="px-3 py-2.5">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-100">
            {deHoy.map((t) => {
              /*
               * Las dos formas se separan en dos variables, en vez de un booleano y afirmaciones
               * de tipo: así el compilador sabe que un pedido tiene teléfono y seña, y que un
               * turno agendado tiene paciente, recurso y serie. Un `as` acá sería exactamente la
               * clase de cosa que deja de ser cierta cuando alguien agregue un campo.
               *
               * Se distingue por `nombreLibre` y **no por `estado`**: desde que `'pedido'` es un
               * estado más, un `Turno` normal también puede declararlo, así que el estado dejó de
               * discriminar. La propiedad que sólo existe de un lado, sí.
               */
              const pedido = 'nombreLibre' in t ? t : null;
              const agendado = 'nombreLibre' in t ? null : t;

              // Quien pidió desde el sitio todavía no es paciente del sistema: no tiene ficha,
              // ni obra social cargada, ni recurso asignado. Mostrarlo como si la tuviera sería
              // el tipo de dato inventado que después nadie encuentra.
              const p = agendado ? pacienteDe(agendado.pacienteId) : null;
              const prof = profesionalDe(t.profesionalId);
              const numeroRecurso = agendado
                ? RECURSOS.findIndex((r) => r.id === agendado.recursoId) + 1
                : 0;
              return (
                <tr
                  key={t.id}
                  className={
                    pedido
                      ? 'bg-purpura-50/40'
                      : t.estado === 'enSala'
                        ? 'bg-ambar-50/40'
                        : undefined
                  }
                >
                  <td className="tabular px-3 py-2.5 font-medium text-gris-900">
                    {hora(t.inicio)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-medium text-gris-900">
                      {p ? `${p.apellido}, ${p.nombre}` : pedido?.nombreLibre}
                    </span>
                    {p && p.deuda > 0 && (
                      <span className="ml-2 rounded-full bg-rojo-50 px-2 py-0.5 text-[11px] font-medium text-rojo-800">
                        debe {pesos(p.deuda)}
                      </span>
                    )}
                    {pedido && (
                      <span className="block text-xs text-gris-500">
                        {pedido.telefono}
                        {pedido.sena > 0 && ` · seña ${pesos(pedido.sena)}`}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-gris-600">
                    {p ? p.obraSocial : <span className="text-gris-400">sin cargar</span>}
                  </td>
                  <td className="px-3 py-2.5 text-gris-700">{prof.nombre}</td>
                  <td className="px-3 py-2.5 text-gris-600">
                    {numeroRecurso > 0 ? (
                      `${may(e.recurso.singular)} ${numeroRecurso}`
                    ) : (
                      <span className="text-gris-400">sin asignar</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-gris-700">
                    {e.practicas[t.indicePractica]}
                    {e.enSeries && agendado && (
                      <span className="tabular ml-2 text-xs text-gris-500">
                        {agendado.serie.numero} de {agendado.serie.total}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${CLASE_ESTADO[t.estado]}`}
                    >
                      {ESTADOS_TURNO[t.estado].etiqueta}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {deHoy.length === 0 && (
          <p className="p-8 text-center text-sm text-gris-600">
            No hay turnos para hoy: los domingos no se atiende.
          </p>
        )}
      </Tarjeta>

      <p className="mt-4 text-xs text-gris-500">
        {contar(PROFESIONALES.length, e.profesional)} · {contar(RECURSOS.length, e.recurso)}
      </p>
    </div>
  );
}
