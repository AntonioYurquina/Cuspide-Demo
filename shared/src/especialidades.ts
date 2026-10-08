/**
 * Las especialidades que el producto soporta.
 *
 * Sólo las **claves**, no el vocabulario ni las fichas: eso es de la vertical y vive en el
 * frontend, que es quien dibuja. Acá está lo que el backend también necesita saber, que es qué
 * valores puede llevar `Centro.especialidad` — y que sean los mismos de los dos lados.
 */

export const CLAVES_ESPECIALIDAD = ['odontologia', 'medicina', 'kinesiologia'] as const;

export type ClaveEspecialidad = (typeof CLAVES_ESPECIALIDAD)[number];

export function esClaveEspecialidad(valor: string): valor is ClaveEspecialidad {
  return (CLAVES_ESPECIALIDAD as readonly string[]).includes(valor);
}
