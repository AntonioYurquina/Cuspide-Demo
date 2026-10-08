/**
 * El armazón del sitio público: lo que ve alguien que **todavía no es paciente**.
 *
 * Es la mitad del producto que ningún sistema de gestión les ofrece. Un centro chico hoy tiene
 * un Instagram y nada más: no tiene dónde mostrar sus horarios, sus profesionales ni qué obras
 * sociales atiende, y el paciente termina preguntando por WhatsApp lo mismo cien veces.
 *
 * **Deliberadamente no se parece al panel de gestión.** El panel es una herramienta de trabajo:
 * denso, oscuro arriba, numerado. Esto es un folleto: claro, espaciado, con una sola cosa para
 * hacer por pantalla. Que compartan la paleta y la tipografía alcanza para que se vean del mismo
 * producto; parecerse más sería confundir a las dos audiencias.
 *
 * La entrada del personal es un enlace discreto al pie, no un botón arriba. Quien trabaja en el
 * centro entra una vez y deja la sesión abierta; el paciente entra cien veces y no tiene cuenta.
 */

import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { MARCA } from '../marca.ts';
import { CENTRO } from '../documentos/Hoja.tsx';

const SECCIONES = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/turnos-online', texto: 'Pedir turno' },
  { ruta: '/tienda', texto: 'Tienda' },
];

export function MarcoPublico({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-gris-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4">
          {/*
            **El nombre del centro, no el del producto.** El sitio público es la cara del centro
            ante su paciente: un paciente que entra a pedir turno no tiene por qué saber con qué
            software está hecho. «Cúspide» queda al pie, donde corresponde a un proveedor.
          */}
          <Link
            to="/"
            className="min-w-0 shrink text-base font-bold tracking-[-.02em] text-gris-900 sm:text-lg"
          >
            {MARCA.nombre}
          </Link>

          <nav className="ml-auto flex items-center gap-1" aria-label="Secciones del sitio">
            {SECCIONES.map((s) => {
              const activo = pathname === s.ruta;
              return (
                <Link
                  key={s.ruta}
                  to={s.ruta}
                  aria-current={activo ? 'page' : undefined}
                  className={`rounded-[9px] px-3 py-2 text-sm transition-colors ${
                    activo
                      ? 'bg-marca-50 font-medium text-marca-800'
                      : 'text-gris-700 hover:bg-gris-50'
                  }`}
                >
                  {s.texto}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-gris-200 bg-gris-50">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold text-gris-900">{MARCA.nombre}</p>
            <p className="mt-1 text-gris-600">{CENTRO.direccion}</p>
            <p className="text-gris-600">{CENTRO.telefono}</p>
            <p className="text-gris-600">{CENTRO.correo}</p>
          </div>

          <nav aria-label="Secciones del sitio">
            <p className="font-semibold text-gris-900">Secciones</p>
            <ul className="mt-1 space-y-1">
              {SECCIONES.map((s) => (
                <li key={s.ruta}>
                  <Link to={s.ruta} className="text-gris-600 underline hover:text-marca-700">
                    {s.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm:text-right">
            <p className="text-gris-600">
              Hecho con <span className="font-semibold text-gris-800">{MARCA.sistema}</span>
            </p>
            {/*
              La entrada del personal, al pie y sin destacar: el paciente no tiene cuenta y ver
              un «Ingresar» arriba lo hace pensar que necesita una.
            */}
            <Link
              to="/login"
              className="mt-2 inline-block text-xs text-gris-500 underline hover:text-gris-700"
            >
              Acceso del personal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** El encabezado de una sección del sitio. Una sola cosa por pantalla. */
export function Encabezado({ titulo, bajada }: { titulo: string; bajada?: string }) {
  return (
    <header className="mx-auto max-w-5xl px-4 pt-10 pb-6 sm:pt-14">
      <h1 className="text-[30px] leading-[1.15] font-bold tracking-[-.03em] text-gris-900 sm:text-[38px]">
        {titulo}
      </h1>
      {bajada && <p className="mt-3 max-w-2xl text-base text-gris-600 sm:text-lg">{bajada}</p>}
    </header>
  );
}
