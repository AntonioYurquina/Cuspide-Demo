/**
 * Los permisos, que ahora viven en `@cuspide/shared`.
 *
 * Este archivo queda como reexportación para no tocar los veinte lugares que lo importan, y
 * sobre todo porque **el permiso tiene que ser el mismo de los dos lados**: el frontend lo usa
 * para ocultar un menú y el backend para rechazar una petición. Si vive en dos archivos, algún
 * día el menú oculta algo que el servidor permite.
 */

export * from '@cuspide/shared';
