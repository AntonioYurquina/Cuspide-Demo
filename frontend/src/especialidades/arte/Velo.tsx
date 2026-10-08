/**
 * El velo que hace legible el texto sobre cualquier fondo del login.
 *
 * Oscurece hacia la izquierda, que es donde cae el título. Sin esto, una pieza marcada o una
 * línea del dibujo detrás de una palabra la vuelve ilegible. Por eso existe este velo.
 *
 * Está acá y no dentro de cada arte porque **las tres verticales lo necesitan igual**: lo único
 * que cambia es el dibujo de atrás.
 */
export function Velo() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(17,33,42,.94)_0%,rgba(17,33,42,.80)_34%,rgba(17,33,42,.34)_100%)]"
    />
  );
}
