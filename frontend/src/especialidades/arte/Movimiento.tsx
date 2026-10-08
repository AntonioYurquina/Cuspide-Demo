/**
 * El fondo del login **de kinesiología**: arcos de rango articular.
 *
 * Lo que el kinesiólogo mide todos los días es cuánto se mueve una articulación y hasta dónde
 * llega. Eso se dibuja como un arco que se abre — y es lo que distingue su trabajo del de las
 * otras dos verticales, donde nada se mide en grados.
 *
 * Mismo criterio que el resto del arte: SVG, sin descargas, trazo fino, debajo del velo, y la
 * animación respeta `prefers-reduced-motion`.
 */

import { Velo } from './Velo.tsx';

/** Cada arco: dónde está el centro, qué radio tiene y cuánto abre. */
const ARCOS = [
  { cx: 250, cy: 240, r: 150, grados: 115 },
  { cx: 600, cy: 420, r: 190, grados: 85 },
  { cx: 300, cy: 650, r: 165, grados: 140 },
  { cx: 640, cy: 790, r: 125, grados: 70 },
];

/** El arco, de la horizontal hasta `grados`, en sentido antihorario. */
function arco(cx: number, cy: number, r: number, grados: number): string {
  const rad = (grados * Math.PI) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy - r * Math.sin(rad);
  return `M${cx + r} ${cy} A${r} ${r} 0 ${grados > 180 ? 1 : 0} 0 ${x.toFixed(1)} ${y.toFixed(1)}`;
}

export function Movimiento() {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 860 900"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 size-full"
      >
        {ARCOS.map((a, i) => {
          const rad = (a.grados * Math.PI) / 180;
          return (
            <g key={`${a.cx}-${a.cy}`}>
              {/* Los dos lados del ángulo, que es lo que da la lectura de grados. */}
              <path
                d={`M${a.cx} ${a.cy} L${a.cx + a.r} ${a.cy} M${a.cx} ${a.cy} L${(a.cx + a.r * Math.cos(rad)).toFixed(1)} ${(a.cy - a.r * Math.sin(rad)).toFixed(1)}`}
                stroke="rgba(255,255,255,.17)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d={arco(a.cx, a.cy, a.r, a.grados)}
                fill="none"
                stroke="rgba(255,255,255,.3)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-vender motion-reduce:animate-none"
                style={{ animationDelay: `${i * 3.1}s` }}
              />
              <circle cx={a.cx} cy={a.cy} r="4" fill="rgba(255,255,255,.28)" />
            </g>
          );
        })}
      </svg>
      <Velo />
    </>
  );
}
