/**
 * Usuarios y permisos.
 *
 * **Es el ancla de credibilidad de la demo.** Cuando el odontólogo pregunte «¿y la secretaria
 * puede ver la facturación?», se abre esta pantalla, se le muestra la matriz, y se cierra la
 * sesión para entrar con ese rol delante de él. No hay nada que explicar.
 */

import {
  ETIQUETA_PERMISO,
  PERMISOS,
  ROLES,
  type ClaveRol,
  type CodigoPermiso,
} from '../permisos.ts';
import { USUARIOS } from '../datos/usuarios.ts';
import { Tarjeta } from '../components/ui.tsx';

const CLAVES = Object.keys(ROLES) as ClaveRol[];

export function PaginaUsuarios() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-.025em] text-gris-900">
          Usuarios y permisos
        </h1>
        <p className="mt-1 text-sm text-gris-600">
          Cada usuario tiene un rol, y el rol decide qué ve. El menú se arma con esto.
        </p>
      </header>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-gris-800">Usuarios</h2>
        <Tarjeta className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-gris-200 bg-gris-50 text-left text-xs font-semibold text-gris-600">
              <tr>
                <th className="px-3 py-2.5">Usuario</th>
                <th className="px-3 py-2.5">Nombre</th>
                <th className="px-3 py-2.5">Rol</th>
                <th className="px-3 py-2.5">Alcance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-100">
              {USUARIOS.map((u) => (
                <tr key={u.usuario}>
                  <td className="px-3 py-2.5 font-mono text-xs text-gris-700">{u.usuario}</td>
                  <td className="px-3 py-2.5 font-medium text-gris-900">{u.nombreCompleto}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-block rounded-full border border-marca-100 bg-marca-50 px-2.5 py-0.5 text-xs font-medium text-marca-800">
                      {ROLES[u.rol].nombre}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gris-600">{ROLES[u.rol].descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gris-800">Qué puede cada rol</h2>
        <Tarjeta className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="border-b border-gris-200 bg-gris-50 text-left text-xs font-semibold text-gris-600">
              <tr>
                <th className="px-3 py-2.5">Permiso</th>
                {CLAVES.map((c) => (
                  <th key={c} className="px-3 py-2.5 text-center">
                    {ROLES[c].nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gris-100">
              {(Object.values(PERMISOS) as CodigoPermiso[]).map((p) => (
                <tr key={p}>
                  <td className="px-3 py-2.5">
                    <span className="block text-gris-900">{ETIQUETA_PERMISO[p]}</span>
                    <span className="block font-mono text-[11px] text-gris-500">{p}</span>
                  </td>
                  {CLAVES.map((c) => {
                    const tiene = (ROLES[c].permisos as readonly CodigoPermiso[]).includes(p);
                    return (
                      <td key={c} className="px-3 py-2.5 text-center">
                        {tiene ? (
                          <span className="text-marca-600" aria-label="Sí">
                            <svg
                              viewBox="0 0 20 20"
                              className="inline size-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              aria-hidden="true"
                            >
                              <path
                                d="M4 10.5l4 4 8-9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-gris-300" aria-label="No">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
      </section>
    </div>
  );
}
