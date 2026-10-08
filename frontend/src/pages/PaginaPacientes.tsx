/**
 * Pacientes: listado con búsqueda y ficha desplegable.
 *
 * La búsqueda ignora acentos, que no es un detalle: en un mostrador nadie escribe «Núñez» con
 * tilde, y la falta hace que la secretaria no encuentre a la persona que tiene
 * enfrente. Acá se resuelve en el navegador porque no hay base; con backend pasa a Postgres con
 * `unaccent`, que ya está escrito.
 */

import { Fragment, useState } from 'react';
import { PACIENTES, atencionesDe, fechaCorta, pesos, profesionalDe } from '../datos/consultorio.ts';
import { Entrada, Tarjeta } from '../components/ui.tsx';
import { Imprimible } from '../components/Imprimible.tsx';
import { useBonosDe } from '../publico/bonos.ts';
import { BotonesDeDocumento } from '../documentos/Visor.tsx';
import { COMUNES } from '../documentos/comunes.tsx';
import { useEspecialidad } from '../especialidades/index.ts';

/** Minúsculas y sin diacríticos, la misma regla que `sin_acentos()` de Postgres. */
function sinAcentos(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/gu, '').toLowerCase();
}

export function PaginaPacientes() {
  const { e } = useEspecialidad();
  const [buscar, setBuscar] = useState('');
  const [abierto, setAbierto] = useState<string | null>(null);

  const criterio = sinAcentos(buscar.trim());
  const encontrados = criterio
    ? PACIENTES.filter(
        (p) =>
          sinAcentos(`${p.apellido} ${p.nombre}`).includes(criterio) ||
          p.documento.includes(criterio),
      )
    : PACIENTES;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-.025em] text-gris-900">Pacientes</h1>
        <p className="mt-1 text-sm text-gris-600">
          {PACIENTES.length} pacientes. Buscá por apellido, nombre o documento.
        </p>
      </header>

      <div className="mb-4 max-w-md">
        <Entrada
          type="search"
          aria-label="Buscar pacientes"
          placeholder="Apellido, nombre o documento"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
      </div>

      <Tarjeta className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-gris-200 bg-gris-50 text-left text-xs font-semibold text-gris-600">
            <tr>
              <th className="px-3 py-2.5">Paciente</th>
              <th className="px-3 py-2.5">Documento</th>
              <th className="px-3 py-2.5">Obra social</th>
              <th className="px-3 py-2.5">Teléfono</th>
              <th className="px-3 py-2.5">Última visita</th>
              <th className="px-3 py-2.5 text-right">Saldo</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-100">
            {encontrados.map((p) => {
              const historial = atencionesDe(p.id);
              return (
                <Fragment key={p.id}>
                  <tr>
                    <td className="px-3 py-2.5 font-medium text-gris-900">
                      {p.apellido}, {p.nombre}
                    </td>
                    <td className="tabular px-3 py-2.5 text-gris-600">{p.documento}</td>
                    <td className="px-3 py-2.5 text-gris-700">
                      {p.obraSocial}
                      {p.obraSocial !== 'Particular' && (
                        <span className="ml-1.5 text-xs text-gris-500">{p.afiliado}</span>
                      )}
                    </td>
                    <td className="tabular px-3 py-2.5 text-gris-600">{p.telefono}</td>
                    <td className="tabular px-3 py-2.5 text-gris-600">
                      {fechaCorta(p.ultimaVisita)}
                    </td>
                    <td className="tabular px-3 py-2.5 text-right">
                      {p.deuda > 0 ? (
                        <span className="font-medium text-rojo-700">{pesos(p.deuda)}</span>
                      ) : (
                        <span className="text-gris-500">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => setAbierto(abierto === p.id ? null : p.id)}
                        className="text-sm text-marca-700 underline"
                      >
                        {abierto === p.id ? 'Cerrar' : 'Ver ficha'}
                      </button>
                    </td>
                  </tr>
                  {abierto === p.id && (
                    <tr>
                      <td colSpan={7} className="bg-gris-50 px-3 py-4">
                        {/*
                          La ficha clínica de la vertical. Esta pantalla no sabe cuál es: agregar
                          una especialidad nueva es agregar un archivo en `especialidades/`, no
                          tocar acá.
                        */}
                        <div className="mb-4">
                          <BotonesDeDocumento
                            documentos={[...COMUNES, ...e.documentos]}
                            paciente={p}
                          />
                        </div>

                        <BonosDelPaciente pacienteId={p.id} />

                        <Imprimible
                          titulo={e.fichaClinica}
                          subtitulo={`${p.apellido}, ${p.nombre} · DNI ${p.documento} · ${p.obraSocial} ${p.afiliado}`}
                        >
                          <e.Ficha paciente={p} />
                        </Imprimible>

                        <p className="mt-5 mb-2 text-xs font-semibold tracking-[.08em] text-gris-600 uppercase">
                          Historial de turnos
                        </p>
                        {historial.length === 0 ? (
                          <p className="text-sm text-gris-600">Sin turnos registrados.</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {historial.slice(0, 6).map((t) => (
                              <li key={t.id} className="text-sm text-gris-700">
                                <span className="tabular text-gris-600">
                                  {fechaCorta(t.inicio)}
                                </span>{' '}
                                · {e.practicas[t.indicePractica]} ·{' '}
                                <span className="text-gris-600">
                                  {profesionalDe(t.profesionalId).nombre}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {encontrados.length === 0 && (
          <p className="p-8 text-center text-sm text-gris-600">
            Ningún paciente coincide. La búsqueda ignora los acentos.
          </p>
        )}
      </Tarjeta>
    </div>
  );
}

/**
 * Los bonos que este paciente compró y todavía no usó.
 *
 * Es la otra mitad de `HU-011`: la tienda vende y **la ficha lo refleja**. Sin esto, el checkout
 * decía «quedan disponibles en tu ficha» y no quedaban en ninguna parte.
 */
function BonosDelPaciente({ pacienteId }: { pacienteId: string }) {
  const { e } = useEspecialidad();
  const bonos = useBonosDe(pacienteId);
  if (bonos.length === 0) return null;

  const disponibles = bonos.reduce((s, b) => s + (b.unidades - b.usadas), 0);

  return (
    <div className="mb-4 rounded-[10px] border border-marca-100 bg-marca-50 px-4 py-3">
      <p className="text-sm font-semibold text-marca-900">
        {disponibles} {disponibles === 1 ? e.unidad.singular : e.unidad.plural} disponibles por bono
      </p>
      <ul className="mt-1 space-y-0.5 text-xs text-marca-800">
        {bonos.map((b) => (
          <li key={b.id}>
            Bono de {b.unidades} · comprado el {b.comprado} · usadas {b.usadas}
          </li>
        ))}
      </ul>
    </div>
  );
}
