/**
 * El armazón de la aplicación: topbar oscura, sidebar por secciones y el contenido.
 *
 * **El menú se filtra por permiso**, y eso es lo que hace demostrable la etapa: al entrar como
 * secretaría, Facturación y Contabilidad no aparecen. No están ocultas con CSS — no se
 * construyen.
 *
 * La numeración de los ítems es correlativa y se calcula sola. Escrita a mano se
 * desincroniza siempre: un dato derivado no se tipea.
 */

import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSesion, useLogout } from '../features/auth/useSesion.ts';
import { useEspecialidad, type Especialidad } from '../especialidades/index.ts';
import { PERMISOS, ROLES, tienePermiso, type CodigoPermiso } from '../permisos.ts';
import { Logo } from './Logo.tsx';
import { ConmutadorEspecialidad } from '../features/demo/ConmutadorEspecialidad.tsx';

interface Item {
  ruta: string;
  texto: string;
  permiso: CodigoPermiso;
}

/**
 * El menú.
 *
 * Es función de la especialidad y no una constante: **cómo se llama la pantalla de derivaciones
 * cambia con la vertical** —«Envíos al laboratorio» en odontología, «Estudios derivados» en
 * medicina, «Equipamiento y service» en kinesiología— y un rótulo fijo ahí era de las cosas que
 * delataban que el producto estaba escrito para un odontólogo.
 */
const gruposDe = (e: Especialidad): { titulo: string; items: Item[] }[] => [
  {
    titulo: 'Atención',
    items: [
      { ruta: '/agenda', texto: 'Agenda del día', permiso: PERMISOS.AGENDA_VER },
      { ruta: '/turnos', texto: 'Turnos', permiso: PERMISOS.TURNOS_VER },
      { ruta: '/pacientes', texto: 'Pacientes', permiso: PERMISOS.PACIENTES_VER },
    ],
  },
  {
    titulo: 'Derivaciones y compras',
    items: [
      { ruta: '/laboratorio', texto: e.derivaciones.menu, permiso: PERMISOS.LABORATORIO_VER },
      { ruta: '/proveedores', texto: 'Proveedores', permiso: PERMISOS.PROVEEDORES_VER },
    ],
  },
  {
    titulo: 'Administración',
    items: [
      { ruta: '/facturacion', texto: 'Facturación y ARCA', permiso: PERMISOS.FACTURACION_VER },
      { ruta: '/contabilidad', texto: 'Contabilidad', permiso: PERMISOS.CONTABILIDAD_VER },
      { ruta: '/usuarios', texto: 'Usuarios y permisos', permiso: PERMISOS.USUARIOS_VER },
      { ruta: '/configuracion', texto: 'Configuración', permiso: PERMISOS.CONFIGURACION_VER },
    ],
  },
];

function iniciales(nombre: string): string {
  const partes = nombre
    .replace(/^(Dra?\.)\s*/i, '')
    .trim()
    .split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
}

export function Layout({ children }: { children: ReactNode }) {
  const { usuario } = useSesion();
  const { e } = useEspecialidad();
  const salir = useLogout();
  const { pathname } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Los grupos que le quedan a este usuario, ya filtrados, con su número correlativo.
  let n = 0;
  const grupos = gruposDe(e)
    .map((g) => ({
      titulo: g.titulo,
      items: g.items
        .filter((i) => tienePermiso(usuario?.permisos, i.permiso))
        .map((i) => ({ ...i, k: String(++n).padStart(2, '0') })),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-dvh bg-fondo">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-tinta-borde bg-tinta-950 px-4 text-tinta-100">
        <button
          type="button"
          aria-label={menuAbierto ? 'Cerrar el menú' : 'Abrir el menú'}
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto((a) => !a)}
          className="rounded-[9px] border border-tinta-borde p-2 transition-colors hover:bg-tinta-900 lg:hidden"
        >
          <svg
            viewBox="0 0 20 20"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
          </svg>
        </button>

        <Logo />

        <div className="ml-auto flex items-center gap-4">
          {/* Se borra con `features/demo/` cuando el consultorio traiga su especialidad. */}
          <ConmutadorEspecialidad />
          {usuario && (
            <>
              <span className="hidden items-center gap-2.5 sm:flex">
                <span className="grid size-8 place-items-center rounded-full bg-marca-600 text-xs font-semibold text-white">
                  {iniciales(usuario.nombreCompleto)}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-medium">{usuario.nombreCompleto}</span>
                  <span className="block text-xs text-tinta-300">{ROLES[usuario.rol].nombre}</span>
                </span>
              </span>
              <button
                type="button"
                onClick={salir}
                className="rounded-[9px] border border-tinta-borde px-3 py-1.5 text-sm transition-colors hover:bg-tinta-900"
              >
                Salir
              </button>
            </>
          )}
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[248px_1fr]">
        <nav
          className={`${menuAbierto ? 'block' : 'hidden'} border-b border-gris-200 bg-white px-3 py-4 lg:block lg:min-h-[calc(100dvh-3.5rem)] lg:border-r lg:border-b-0`}
          aria-label="Secciones"
        >
          {grupos.map((g) => (
            <div key={g.titulo} className="mb-5">
              <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">
                {g.titulo}
              </p>
              {g.items.map((i) => {
                const activo = pathname === i.ruta;
                return (
                  <Link
                    key={i.ruta}
                    to={i.ruta}
                    onClick={() => setMenuAbierto(false)}
                    aria-current={activo ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-[9px] px-3 py-2 text-sm transition-colors ${
                      activo
                        ? 'bg-marca-50 font-medium text-marca-800'
                        : 'text-gris-700 hover:bg-gris-50'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-4 text-center font-mono text-[11px] font-semibold opacity-55"
                    >
                      {i.k}
                    </span>
                    {i.texto}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
