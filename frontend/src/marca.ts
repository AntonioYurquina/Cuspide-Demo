/**
 * Identidad visual del sistema.
 *
 * Todo lo que el usuario lee como «nombre del producto» sale de acá. Cambiarlo es **una línea**,
 * para que el nombre no viva en dos lugares diciendo cosas distintas.
 *
 * `logo` e `imagenFondoLogin` quedan listos para cuando el consultorio entregue sus archivos:
 * se copian a `public/marca/` y se apunta la ruta acá, por ejemplo `'/marca/logo.svg'`. Mientras
 * sean `null` mandan el isotipo y el fondo dibujados con CSS, que no dependen de ningún archivo.
 */

export const MARCA = {
  /** El centro de salud. En la demo es de ejemplo; se cambia por el del cliente real. */
  nombre: 'Centro de Salud Belgrano',
  sistema: 'Cúspide',
  version: '',
  logo: null as string | null,
  imagenFondoLogin: null as string | null,
} as const;
