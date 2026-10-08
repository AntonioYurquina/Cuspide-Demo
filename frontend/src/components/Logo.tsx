/**
 * Isotipo y logotipo de Cúspide.
 *
 * El isotipo es una cumbre dibujada en SVG, así que no espera ningún archivo.
 * Si algún día `MARCA.logo` apunta a una imagen, esa imagen manda.
 *
 * `chico` es el de la topbar (20 px, solo el logotipo); `grande`, el del login
 * (26 px, con el nombre de la empresa arriba).
 *
 * `sobre` es el fondo donde se apoya. Existe porque el login lo usa en los dos: sobre el panel
 * oscuro en escritorio y sobre el fondo claro en celular, donde el panel se retira. Los tonos
 * de `tinta` están pensados para fondo oscuro y sobre claro no llegan al contraste mínimo.
 */

import { MARCA } from '../marca.ts';

export function Logo({
  tamano = 'chico',
  sobre = 'oscuro',
}: {
  tamano?: 'chico' | 'grande';
  sobre?: 'oscuro' | 'claro';
}) {
  if (MARCA.logo) {
    return <img src={MARCA.logo} alt={MARCA.nombre} className="max-h-8 w-auto" />;
  }

  const grande = tamano === 'grande';

  return (
    <div className={`flex items-center ${grande ? 'gap-3' : 'gap-2.5'}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className={grande ? 'size-[26px]' : 'size-5'}>
        <path d="M12 2 22 21H2Z" className="fill-marca-300" />
        <path d="M12 11 16.5 21h-9Z" className="fill-marca-400" />
      </svg>
      <div className="leading-[1.15]">
        {grande && (
          <span
            className={`block text-[11px] tracking-[.14em] uppercase ${
              sobre === 'claro' ? 'text-gris-600' : 'text-tinta-300'
            }`}
          >
            {MARCA.nombre}
          </span>
        )}
        <span
          className={`block font-bold tracking-[-.01em] ${grande ? 'text-[17px]' : 'text-[15px]'} ${
            sobre === 'claro' ? 'text-gris-900' : ''
          }`}
        >
          {MARCA.sistema}
          {/* La versión es opcional: hoy va vacía y el logotipo queda sólo con el nombre. */}
          {MARCA.version && (
            <>
              {' '}
              <span className={sobre === 'claro' ? 'text-marca-600' : 'text-marca-300'}>
                {MARCA.version}
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
