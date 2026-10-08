/**
 * La agenda semanal, por profesional.
 *
 * La vista que usa quien da turnos: de un vistazo, qué franjas están libres y con quién. Las
 * columnas son los días y las filas las horas, que es como se lee una agenda en papel — la
 * metáfora que el consultorio ya tiene.
 */

import { useState } from 'react';
import {
  ESTADOS_TURNO,
  HOY,
  PROFESIONALES,
  TURNOS,
  dia,
  hora,
  mismoDia,
  pacienteDe,
  type EstadoTurno,
  type ProfesionalId,
} from '../datos/consultorio.ts';
import { Selector, Tarjeta } from '../components/ui.tsx';
import { may, useEspecialidad } from '../especialidades/index.ts';
import { comoTurnos, usePedidos } from '../publico/pedidos.ts';

const HORAS = [9, 10, 11, 12, 15, 16, 17, 18];

const CLASE_ESTADO: Record<EstadoTurno, string> = {
  confirmado: 'bg-tinta-50 border-tinta-200 text-tinta-700',
  enSala: 'bg-ambar-50 border-ambar-100 text-ambar-700',
  atendido: 'bg-marca-50 border-marca-100 text-marca-800',
  ausente: 'bg-rojo-50 border-rojo-100 text-rojo-800',
  aConfirmar: 'bg-gris-100 border-gris-300 text-gris-700',
  pedido: 'bg-purpura-50 border-purpura-200 text-purpura-800',
};

export function PaginaTurnos() {
  const { e } = useEspecialidad();
  const [profesional, setProfesional] = useState<ProfesionalId | 'todos'>('todos');
  const [semana, setSemana] = useState(0);

  // De lunes a sábado de la semana elegida.
  const lunes = (() => {
    const d = dia(semana * 7);
    const haciaAtras = (d.getDay() + 6) % 7;
    return dia(semana * 7 - haciaAtras);
  })();
  const dias = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(d.getDate() + i);
    return d;
  });

  /*
   * Los pedidos del sitio entran acá también. La leyenda de esta pantalla prometía el estado
   * «Pedido por el paciente» y **no podía dibujarlo nunca**, porque sólo miraba `TURNOS`.
   * Una leyenda que describe algo que la pantalla no muestra es peor que no tenerla.
   */
  const pedidos = comoTurnos(usePedidos());
  const visibles = [...TURNOS, ...pedidos].filter(
    (t) => profesional === 'todos' || t.profesionalId === profesional,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-.025em] text-gris-900">Turnos</h1>
        <p className="mt-1 text-sm text-gris-600">
          La semana completa. Elegí un {e.profesional.singular} para ver sólo su agenda.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Selector
          aria-label={may(e.profesional.singular)}
          className="w-auto"
          value={profesional}
          onChange={(e) => setProfesional(e.target.value as ProfesionalId | 'todos')}
        >
          <option value="todos">Todos los {e.profesional.plural}</option>
          {PROFESIONALES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </Selector>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSemana((s) => s - 1)}
            className="rounded-[9px] border border-gris-300 bg-white px-3 py-1.5 text-sm text-gris-800 transition-colors hover:bg-gris-100"
          >
            ← Semana anterior
          </button>
          <button
            type="button"
            onClick={() => setSemana(0)}
            className="rounded-[9px] border border-gris-300 bg-white px-3 py-1.5 text-sm text-gris-800 transition-colors hover:bg-gris-100"
          >
            Esta semana
          </button>
          <button
            type="button"
            onClick={() => setSemana((s) => s + 1)}
            className="rounded-[9px] border border-gris-300 bg-white px-3 py-1.5 text-sm text-gris-800 transition-colors hover:bg-gris-100"
          >
            Semana siguiente →
          </button>
        </div>
      </div>

      <Tarjeta className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gris-200 bg-gris-50">
              <th className="w-16 px-2 py-2.5 text-left text-xs font-semibold text-gris-600">
                Hora
              </th>
              {dias.map((d) => (
                <th
                  key={d.toISOString()}
                  className={`px-2 py-2.5 text-left text-xs font-semibold ${
                    mismoDia(d, HOY) ? 'text-marca-800' : 'text-gris-600'
                  }`}
                >
                  <span className="block capitalize">
                    {d.toLocaleDateString('es-AR', { weekday: 'short' })}
                  </span>
                  <span className="block text-[11px] font-normal text-gris-500">
                    {d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((h) => (
              <tr key={h} className="border-b border-gris-100 align-top">
                <td className="tabular px-2 py-1.5 text-xs text-gris-500">
                  {String(h).padStart(2, '0')}:00
                </td>
                {dias.map((d) => {
                  const enLaFranja = visibles.filter(
                    (t) => mismoDia(t.inicio, d) && t.inicio.getHours() === h,
                  );
                  return (
                    <td
                      key={d.toISOString()}
                      className={`px-1.5 py-1.5 ${mismoDia(d, HOY) ? 'bg-marca-50/30' : ''}`}
                    >
                      <div className="space-y-1">
                        {enLaFranja.map((t) => {
                          // Quien pidió desde el sitio todavía no es paciente del sistema: se
                          // separan las dos formas para que el compilador sepa cuál es cuál.
                          const pedido = 'nombreLibre' in t ? t : null;
                          const agendado = 'nombreLibre' in t ? null : t;
                          const p = agendado ? pacienteDe(agendado.pacienteId) : null;
                          const nombre = p
                            ? `${p.apellido}, ${p.nombre[0]}.`
                            : (pedido?.nombreLibre ?? '');
                          return (
                            <div
                              key={t.id}
                              title={`${e.practicas[t.indicePractica]} · ${ESTADOS_TURNO[t.estado].etiqueta}`}
                              className={`rounded-[7px] border px-2 py-1 text-xs leading-tight ${CLASE_ESTADO[t.estado]}`}
                            >
                              <span className="tabular block font-medium">{hora(t.inicio)}</span>
                              <span className="block truncate">{nombre}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gris-600">
        {Object.entries(ESTADOS_TURNO).map(([clave, e]) => (
          <span key={clave} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`inline-block size-3 rounded-[3px] border ${CLASE_ESTADO[clave as EstadoTurno]}`}
            />
            {e.etiqueta}
          </span>
        ))}
      </div>
    </div>
  );
}
