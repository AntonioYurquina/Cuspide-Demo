/**
 * Pedir un turno desde el sitio.
 *
 * **Es lo que cierra el círculo entre el sitio y la gestión**: el paciente pide, y el turno
 * aparece en la agenda del profesional sin que nadie lo copie a mano. Ese es el argumento de
 * venta, y no se cuenta: se pide un turno y después se abre la agenda.
 *
 * Dos decisiones:
 *
 * 1. **La disponibilidad sale de la agenda real.** No se ofrece una franja ocupada, y las que se
 *    muestran son las que realmente están libres en `TURNOS`. Una demo que ofrece cualquier
 *    horario y después «lo confirmamos por teléfono» es el problema que el producto viene a
 *    resolver, no la solución.
 *
 * 2. **La seña está a la vista y es opcional.** El ausentismo es el dolor más caro de un
 *    consultorio —una franja perdida no se recupera— y la seña es el remedio conocido. Ponerla
 *    como obligatoria espanta al paciente nuevo; esconderla no sirve de nada. Va elegida por
 *    omisión y se puede sacar.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HOY,
  PROFESIONALES,
  TURNOS,
  conHora,
  dia,
  hora,
  fechaCorta,
  pesos,
  type ProfesionalId,
} from '../datos/consultorio.ts';
import { may, useEspecialidad } from '../especialidades/index.ts';
import { Entrada } from '../components/ui.tsx';
import { Encabezado } from './Marco.tsx';
import { useTitulo } from './seo.ts';
import { agregarPedido, leerPedidos } from './pedidos.ts';

/**
 * Las franjas del centro. Las horas en punto son las que genera la agenda; dentro de cada hora,
 * **cuántas franjas entran lo dice la duración que declara la especialidad**.
 *
 * Antes se ofrecía una por hora en las tres, contra los 20, 30 o 45 minutos que anuncia
 * Configuración en la misma demostración.
 */
const FRANJAS_SEMANA = [9, 10, 11, 12, 15, 16, 17, 18];
const FRANJAS_SABADO = [9, 10, 11];

/** Cuánto se pide de seña. En la etapa dos sale de la configuración del centro. */
const SENA = 12_000;

interface Libre {
  offset: number;
  hora: number;
  inicio: Date;
}

/**
 * Las franjas realmente libres de un profesional, de hoy en adelante.
 *
 * Se cruza contra `TURNOS` y contra los pedidos ya hechos en esta demostración: pedir dos veces
 * el mismo horario tiene que fallar como falla de verdad.
 */
function librasDe(profesionalId: ProfesionalId, minutos: number): Libre[] {
  const ocupadas = new Set<string>();
  for (const t of TURNOS) {
    if (t.profesionalId === profesionalId) ocupadas.add(t.inicio.toISOString());
  }
  for (const p of leerPedidos()) {
    if (p.profesionalId === profesionalId) ocupadas.add(new Date(p.inicio).toISOString());
  }

  const libres: Libre[] = [];
  for (let offset = 0; offset <= 14; offset++) {
    const fecha = dia(offset);
    const diaSemana = fecha.getDay();
    if (diaSemana === 0) continue;
    for (const h of diaSemana === 6 ? FRANJAS_SABADO : FRANJAS_SEMANA) {
      for (let m = 0; m + minutos <= 60; m += minutos) {
        const inicio = conHora(offset, h, m);
        // Hoy, sólo lo que todavía no pasó.
        if (offset === 0 && inicio <= HOY) continue;
        if (ocupadas.has(inicio.toISOString())) continue;
        libres.push({ offset, hora: h, inicio });
      }
    }
  }
  return libres;
}

// El mismo formato que el panel: `hora` del núcleo.

function Paso({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-gris-200 py-6 first:border-t-0 first:pt-0">
      <h2 className="flex items-center gap-2.5 text-base font-semibold text-gris-900">
        <span className="tabular grid size-6 shrink-0 place-items-center rounded-full bg-marca-600 text-xs font-bold text-white">
          {numero}
        </span>
        {titulo}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function PaginaTurnosOnline() {
  const { e } = useEspecialidad();
  useTitulo(
    'Pedir un turno',
    'Pedí tu turno por internet: elegí profesional, día y horario entre los que están realmente libres.',
  );
  const [profesionalId, setProfesionalId] = useState<ProfesionalId | null>(null);
  const [indicePractica, setIndicePractica] = useState(0);
  const [elegida, setElegida] = useState<Libre | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [conSena, setConSena] = useState(true);
  const [pedido, setPedido] = useState<{ cuando: Date; profesional: string; sena: number } | null>(
    null,
  );

  const libres = useMemo(
    () => (profesionalId ? librasDe(profesionalId, e.minutosPorTurno) : []),
    // `pedido` entra a propósito: después de pedir uno, la franja tomada deja de ofrecerse.
    [profesionalId, pedido, e.minutosPorTurno],
  );

  const porDia = useMemo(() => {
    const mapa = new Map<number, Libre[]>();
    for (const l of libres) mapa.set(l.offset, [...(mapa.get(l.offset) ?? []), l]);
    return [...mapa.entries()].slice(0, 6);
  }, [libres]);

  if (pedido) {
    return (
      <>
        <Encabezado titulo="Listo, tu turno quedó pedido" />
        <div className="mx-auto max-w-2xl px-4 pb-10">
          <div className="rounded-[12px] border border-marca-100 bg-marca-50 p-6">
            <p className="text-base text-marca-900">
              <strong>{fechaCorta(pedido.cuando)}</strong> a las{' '}
              <strong>{hora(pedido.cuando)}</strong>, con {pedido.profesional}.
            </p>
            <p className="mt-2 text-sm text-marca-800">
              {pedido.sena > 0
                ? `Reservado con una seña de ${pesos(pedido.sena)}, que se descuenta del total.`
                : 'Sin seña. Si no vas a poder venir, avisanos con 24 horas.'}
            </p>
          </div>

          <div className="mt-5 rounded-[12px] border border-gris-200 p-5">
            <p className="text-sm font-semibold text-gris-900">
              El turno ya está en la agenda del centro
            </p>
            <p className="mt-1 text-sm text-gris-600">
              Nadie lo copió a mano. Entra como <strong>pedido por el paciente</strong> y queda
              pendiente de confirmación — el centro te llama si hace falta mover algo.
            </p>
            <p className="mt-3 text-xs text-gris-500">
              En esta demostración podés comprobarlo: entrá con{' '}
              <Link to="/login" className="underline">
                el acceso del personal
              </Link>{' '}
              y mirá la agenda del día correspondiente.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPedido(null);
              setElegida(null);
              setNombre('');
              setTelefono('');
            }}
            className="mt-5 rounded-[10px] border border-gris-300 px-4 py-2 text-sm text-gris-700 transition-colors hover:bg-gris-50"
          >
            Pedir otro turno
          </button>
        </div>
      </>
    );
  }

  const completo =
    profesionalId && elegida && nombre.trim().length > 2 && telefono.trim().length > 5;

  return (
    <>
      <Encabezado
        titulo="Pedir un turno"
        bajada="Elegí con quién y cuándo. Los horarios que ves son los que están realmente libres."
      />

      <div className="mx-auto max-w-2xl px-4 pb-10">
        {/* Sin el oficio: «Elegí médico» no lleva artículo y «Elegí la kinesióloga» obliga a
            saber el género de alguien que todavía no se eligió. */}
        <Paso numero={1} titulo="Elegí con quién te atendés">
          <div className="grid gap-2 sm:grid-cols-3">
            {PROFESIONALES.map((p) => {
              const activo = profesionalId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProfesionalId(p.id);
                    setElegida(null);
                  }}
                  aria-pressed={activo}
                  className={`rounded-[10px] border px-4 py-3 text-left transition-colors ${
                    activo
                      ? 'border-marca-500 bg-marca-50'
                      : 'border-gris-300 hover:border-marca-300 hover:bg-gris-50'
                  }`}
                >
                  <span className="block text-sm font-medium text-gris-900">{p.nombre}</span>
                  <span className="block text-xs text-gris-600">
                    {may(p.genero === 'f' ? e.profesionalF.singular : e.profesional.singular)}{' '}
                    <span className="tabular">· {p.matricula}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Paso>

        {profesionalId && (
          <Paso numero={2} titulo={`¿Qué necesitás?`}>
            <label className="sr-only" htmlFor="practica">
              {may(e.unidad.singular)}
            </label>
            <select
              id="practica"
              value={indicePractica}
              onChange={(ev) => setIndicePractica(Number(ev.target.value))}
              className="w-full rounded-[10px] border border-gris-300 bg-white px-3 py-2.5 text-sm text-gris-900"
            >
              {e.practicas.map((p, i) => (
                <option key={p} value={i}>
                  {p}
                </option>
              ))}
            </select>
          </Paso>
        )}

        {profesionalId && (
          <Paso numero={3} titulo="Elegí el horario">
            {porDia.length === 0 ? (
              <p className="text-sm text-gris-600">
                No quedan horarios libres en las próximas dos semanas con este profesional. Probá
                con otro o llamanos.
              </p>
            ) : (
              <div className="space-y-4">
                {porDia.map(([offset, franjas]) => (
                  <div key={offset}>
                    <p className="mb-1.5 text-sm font-medium text-gris-800">
                      {dia(offset).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {franjas.map((l) => {
                        const activo = elegida?.inicio.getTime() === l.inicio.getTime();
                        return (
                          <button
                            key={l.inicio.toISOString()}
                            type="button"
                            onClick={() => setElegida(l)}
                            aria-pressed={activo}
                            className={`tabular rounded-[9px] border px-3.5 py-2 text-sm transition-colors ${
                              activo
                                ? 'border-marca-600 bg-marca-600 font-medium text-white'
                                : 'border-gris-300 text-gris-800 hover:border-marca-300 hover:bg-marca-50'
                            }`}
                          >
                            {hora(l.inicio)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Paso>
        )}

        {elegida && (
          <Paso numero={4} titulo="Tus datos">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gris-800">Nombre y apellido</span>
                <Entrada value={nombre} onChange={(ev) => setNombre(ev.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gris-800">Teléfono</span>
                <Entrada
                  type="tel"
                  value={telefono}
                  onChange={(ev) => setTelefono(ev.target.value)}
                />
              </label>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[10px] border border-gris-300 p-4">
              <input
                type="checkbox"
                checked={conSena}
                onChange={(ev) => setConSena(ev.target.checked)}
                className="mt-0.5 size-4 accent-[var(--color-marca-600)]"
              />
              <span className="text-sm">
                <span className="block font-medium text-gris-900">
                  Reservar con seña de {pesos(SENA)}
                </span>
                <span className="mt-0.5 block text-gris-600">
                  Se descuenta del total de la atención. Si avisás con 24 horas, se devuelve.
                </span>
              </span>
            </label>
          </Paso>
        )}

        {elegida && (
          <div className="border-t border-gris-200 pt-6">
            <button
              type="button"
              disabled={!completo}
              onClick={() => {
                const profesional = PROFESIONALES.find((p) => p.id === profesionalId)!;
                agregarPedido({
                  profesionalId: profesionalId!,
                  inicio: elegida.inicio.toISOString(),
                  indicePractica,
                  // La duración la declara la especialidad: Configuración la muestra y el turno
                  // entraba con 30 minutos fijos, contradiciéndola.
                  minutos: e.minutosPorTurno,
                  paciente: nombre.trim(),
                  telefono: telefono.trim(),
                  sena: conSena ? SENA : 0,
                });
                setPedido({
                  cuando: elegida.inicio,
                  profesional: profesional.nombre,
                  sena: conSena ? SENA : 0,
                });
              }}
              className="w-full rounded-[10px] bg-marca-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-marca-700 disabled:cursor-not-allowed disabled:bg-gris-300"
            >
              {conSena ? `Reservar con seña de ${pesos(SENA)}` : 'Pedir el turno'}
            </button>
            {!completo && (
              <p className="mt-2 text-center text-xs text-gris-500">
                Completá tu nombre y tu teléfono para continuar.
              </p>
            )}
            <p className="mt-3 text-center text-xs text-gris-500">
              El cobro de la seña no está conectado en esta demostración: la pasarela llega con el
              servidor.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
