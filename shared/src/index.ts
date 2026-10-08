/**
 * Lo que comparten el frontend y el backend.
 *
 * **La regla de qué entra acá**: lo que tiene que decir lo mismo de los dos lados. Un permiso
 * que el frontend usa para ocultar un menú y el backend para rechazar una petición **es el mismo
 * permiso**, y si vive en dos archivos, algún día dicen cosas distintas — el menú oculta algo que
 * el servidor permite, o al revés.
 *
 * Lo que **no** entra: nada de React, nada de Prisma, nada que dependa del navegador o del
 * servidor. Este paquete lo importan los dos, así que todo lo que traiga se lo lleva puesto el
 * que no lo necesitaba.
 *
 * Hoy trae los permisos y las claves de especialidad. El resto se irá moviendo desde el frontend
 * a medida que el backend lo necesite: mover algo acá antes de que haya un segundo consumidor es
 * inventarse una abstracción.
 */

// Con extensión `.js` y no `.ts`: este paquete **emite**, a diferencia del frontend, que lo
// consume un bundler. TypeScript resuelve `./permisos.js` contra `permisos.ts` al compilar y
// deja el `.js` en la salida, que es lo que Node va a buscar.
export * from './permisos.js';
export * from './especialidades.js';
