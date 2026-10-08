/**
 * El fondo del login **de odontología**: las dos arcadas, con piezas que se van marcando.
 *
 * Dibuja lo que el sistema administra. Un fondo que
 * no dice nada del negocio es adorno; éste se entiende sin explicarlo, y a un odontólogo le
 * habla en su idioma desde la pantalla de ingreso.
 *
 * **Vive en la vertical y no en `features/auth/`.** Antes se dibujaba siempre, en las tres
 * especialidades: un kinesiólogo entraba al sistema que le vendían como suyo y lo recibía una
 * boca. Cada vertical trae la suya y el login no sabe cuál es.
 *
 * **Va en SVG, no en imagen**: no agrega ninguna descarga ni depende de ningún archivo.
 *
 * Dos cosas lo mantienen en su lugar de fondo: el trazo es fino y va
 * debajo de un **velo** que oscurece hacia la izquierda, que es donde cae el texto. Sin el velo,
 * una pieza marcada detrás de una palabra la vuelve ilegible.
 *
 * La animación respeta `prefers-reduced-motion`: a quien pidió menos movimiento se le muestran
 * las piezas quietas.
 */

import { Velo } from './Velo.tsx';

/** La numeración internacional: cuadrantes 1 y 2 arriba, 4 y 3 abajo. */
const PIEZAS_SUPERIORES = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const PIEZAS_INFERIORES = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

/** Las piezas que se marcan, con su color y su turno. Los colores dicen qué pasó con la pieza. */
const MARCAS: Record<number, { color: string; demora: number }> = {
  16: { color: '#b3382f', demora: 0 }, // restaurada
  24: { color: '#4f96cc', demora: 1.7 }, // tratamiento de conducto
  36: { color: '#b5761b', demora: 3.2 }, // en tratamiento
  11: { color: '#3d8f61', demora: 4.8 }, // sana, control
  47: { color: '#b3382f', demora: 6.3 },
  22: { color: '#3d8f61', demora: 7.8 },
  35: { color: '#4f96cc', demora: 9.2 },
  14: { color: '#b5761b', demora: 10.6 },
  41: { color: '#3d8f61', demora: 12 },
  27: { color: '#b3382f', demora: 13.2 },
};

const ANCHO = 42;
const ALTO = 54;
const SEPARACION = 6;

/** Una arcada: dieciséis piezas en arco, con las del fondo más chicas. */
function Arcada({ piezas, y, haciaArriba }: { piezas: number[]; y: number; haciaArriba: boolean }) {
  const total = piezas.length;
  return (
    <g>
      {piezas.map((pieza, i) => {
        // El arco: las piezas de los extremos bajan (o suben) respecto de las del centro.
        const desdeElCentro = Math.abs(i - (total - 1) / 2) / ((total - 1) / 2);
        const curva = desdeElCentro * desdeElCentro * 92;
        const yPieza = haciaArriba ? y + curva : y - curva;
        const x = 40 + i * (ANCHO + SEPARACION);
        const marca = MARCAS[pieza];

        return (
          <g key={pieza}>
            <rect
              x={x}
              y={yPieza}
              width={ANCHO}
              height={ALTO}
              rx="9"
              fill="none"
              stroke="#7ec89b"
              strokeOpacity=".15"
              strokeWidth="1"
            />
            {marca && (
              <rect
                x={x}
                y={yPieza}
                width={ANCHO}
                height={ALTO}
                rx="9"
                fill={marca.color}
                style={{ animationDelay: `${marca.demora}s` }}
                className="animate-marcar opacity-0 motion-reduce:animate-none motion-reduce:opacity-25"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

export function ArcadaDental() {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 860 900"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 size-full"
      >
        <Arcada piezas={PIEZAS_SUPERIORES} y={210} haciaArriba />
        <Arcada piezas={PIEZAS_INFERIORES} y={560} haciaArriba={false} />
      </svg>

      <Velo />
    </>
  );
}
