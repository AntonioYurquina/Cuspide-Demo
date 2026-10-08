/**
 * Si lo que se está dibujando va al papel o a la pantalla.
 *
 * **Por qué hace falta.** `Imprimible` monta la ficha dos veces: una en la pantalla y otra en
 * `#impresion`. Son dos instancias de React con su propio estado, así que lo que el profesional
 * despliega en pantalla **no está desplegado en la copia que se imprime**. La historia clínica
 * salía con una sola de las cuatro consultas, y encima no la que él tenía abierta: la primera,
 * porque era el valor inicial del `useState` de la otra instancia.
 *
 * Es de los defectos que no se ven nunca mirando la pantalla, que es justo donde se ve bien.
 *
 * La regla no es «replicar lo que está abierto» sino otra: **en papel va todo**. Una historia
 * clínica impresa a la que le faltan tres de cuatro consultas no sirve para nada —no se puede
 * archivar ni adjuntar— y nadie imprime una ficha para ver un pedazo.
 */

import { createContext, useContext } from 'react';

export const ContextoPapel = createContext(false);

/** `true` sólo dentro de la hoja que se imprime. */
export function useEnPapel(): boolean {
  return useContext(ContextoPapel);
}
