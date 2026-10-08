/**
 * El fondo del login **de medicina general**: un trazado de electrocardiograma.
 *
 * Es lo que un clínico reconoce sin que se lo expliquen, igual que la arcada para el
 * odontólogo. Mismo criterio que el resto del arte: SVG, sin ninguna descarga, trazo fino y
 * debajo del velo.
 *
 * La animación respeta `prefers-reduced-motion`: a quien pidió menos movimiento se le muestra
 * el trazado quieto.
 */

import { Velo } from './Velo.tsx';

/** Un latido: línea de base, P, el complejo QRS y la T. Se repite a lo ancho. */
const LATIDO = 'h26 l6 -9 l5 9 h10 l5 4 l7 -42 l7 62 l6 -24 h9 l6 -12 l7 12 h24';

export function Pulso() {
  const filas = [150, 330, 510, 690];
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 860 900"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 size-full"
      >
        {/* La cuadrícula del papel milimetrado, muy tenue. */}
        <defs>
          <pattern id="milimetrado" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="rgba(255,255,255,.055)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="860" height="900" fill="url(#milimetrado)" />

        {filas.map((y, i) => (
          <path
            key={y}
            d={`M-40 ${y} ${LATIDO} ${LATIDO} ${LATIDO} ${LATIDO} ${LATIDO} ${LATIDO}`}
            fill="none"
            stroke="rgba(255,255,255,.3)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="animate-vender motion-reduce:animate-none"
            style={{ animationDelay: `${i * 2.6}s` }}
          />
        ))}
      </svg>
      <Velo />
    </>
  );
}
