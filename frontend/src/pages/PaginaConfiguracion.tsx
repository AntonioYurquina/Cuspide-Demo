/**
 * Configuración: los datos del centro, los profesionales, los recursos y las obras sociales.
 *
 * En la demo se muestran; en la etapa dos se editan. Lo que importa acá es que el cliente vea
 * que el sistema se adapta a **su** centro y no al revés.
 *
 * **La tarjeta «Lo que define tu especialidad» es el argumento de venta por escrito.** Es el
 * único lugar donde se ve junto todo lo que el sistema cambió solo al elegir la especialidad: la
 * ficha clínica, las tres palabras y los documentos que imprime. Con el conmutador de la barra
 * al lado, el cliente cambia la especialidad y ve esta tarjeta cambiar entera.
 */

import { RECURSOS, OBRAS_SOCIALES, PROFESIONALES } from '../datos/consultorio.ts';
import { may, useEspecialidad } from '../especialidades/index.ts';
import { MARCA } from '../marca.ts';
import { Aviso, Tarjeta } from '../components/ui.tsx';

export function PaginaConfiguracion() {
  const { e } = useEspecialidad();

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-.025em] text-gris-900">Configuración</h1>
        <p className="mt-1 text-sm text-gris-600">
          Lo que hace que el sistema sea el de tu centro.
        </p>
      </header>

      <Aviso tono="info">
        En esta etapa la configuración se muestra pero no se edita. El nombre, el logo y los colores
        se cambian en un solo lugar del código, y pasan a ser editables desde acá en la etapa dos.
      </Aviso>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Tarjeta className="p-5">
          <h2 className="text-sm font-semibold text-gris-800">El centro</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gris-600">Nombre</dt>
              <dd className="text-right font-medium text-gris-900">{MARCA.nombre}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gris-600">Especialidad</dt>
              <dd className="text-right font-medium text-gris-900">{e.nombre}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gris-600">Obras sociales</dt>
              <dd className="text-right text-gris-900">{OBRAS_SOCIALES.length}</dd>
            </div>
          </dl>
        </Tarjeta>

        <Tarjeta className="p-5">
          <h2 className="text-sm font-semibold text-gris-800">{may(e.recurso.plural)}</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-gris-700">
            {RECURSOS.map((r, i) => (
              <li key={r.id} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-marca-400" />
                {may(e.recurso.singular)} {i + 1}
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta className="p-5 sm:col-span-2">
          <h2 className="text-sm font-semibold text-gris-800">{may(e.profesional.plural)}</h2>
          <ul className="mt-3 divide-y divide-gris-100">
            {PROFESIONALES.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                <span className="font-medium text-gris-900">{p.nombre}</span>
                <span className="text-gris-600">{p.matricula}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta className="p-5 sm:col-span-2">
          <h2 className="text-sm font-semibold text-gris-800">Lo que define tu especialidad</h2>
          <p className="mt-1 text-sm text-gris-600">
            Nada de esto se escribe a mano: sale de la especialidad del centro. El resto del sistema
            —agenda, turnos, pacientes, facturación— es exactamente el mismo.
          </p>

          <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4 border-b border-gris-100 pb-2">
              <dt className="text-gris-600">Ficha clínica</dt>
              <dd className="text-right font-medium text-gris-900">{e.fichaClinica}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-gris-100 pb-2">
              <dt className="text-gris-600">Duración del turno</dt>
              <dd className="tabular text-right font-medium text-gris-900">
                {e.minutosPorTurno} min
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-gris-100 pb-2">
              <dt className="text-gris-600">Quién atiende</dt>
              <dd className="text-right text-gris-900">{may(e.profesional.singular)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-gris-100 pb-2">
              <dt className="text-gris-600">Dónde se atiende</dt>
              <dd className="text-right text-gris-900">{may(e.recurso.singular)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-gris-100 pb-2">
              <dt className="text-gris-600">Qué se hace</dt>
              <dd className="text-right text-gris-900">{may(e.unidad.singular)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-gris-100 pb-2">
              <dt className="text-gris-600">Se atiende por series</dt>
              <dd className="text-right text-gris-900">{e.enSeries ? 'Sí' : 'No'}</dd>
            </div>
          </dl>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold tracking-[.08em] text-gris-500 uppercase">
                Documentos que imprime
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-gris-700">
                {e.documentos.map((d) => (
                  <li key={d.nombre} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 rounded-full bg-marca-400"
                    />
                    {d.nombre}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-[.08em] text-gris-500 uppercase">
                {may(e.unidad.plural)} del nomenclador
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {e.practicas.map((pr) => (
                  <span
                    key={pr}
                    className="rounded-full border border-marca-100 bg-marca-50 px-3 py-1 text-xs text-marca-800"
                  >
                    {pr}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta className="p-5 sm:col-span-2">
          <h2 className="text-sm font-semibold text-gris-800">Obras sociales</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {OBRAS_SOCIALES.map((o) => (
              <span
                key={o}
                className="rounded-full border border-gris-200 bg-gris-50 px-3 py-1 text-xs text-gris-700"
              >
                {o}
              </span>
            ))}
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}
