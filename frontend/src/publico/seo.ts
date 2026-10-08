/**
 * Lo que hace que el sitio aparezca en una búsqueda.
 *
 * **Un sitio que no aparece no sirve para lo que se hizo**, y es la mitad de lo que se le vende
 * al centro: hoy el paciente lo busca en el teléfono y encuentra un Instagram.
 *
 * Dos cosas, y las dos son baratas:
 *
 * 1. **Un título por página.** Una aplicación de una sola página deja el mismo `<title>` en
 *    todas, así que las tres se indexan con el mismo encabezado y compiten entre sí. Es el
 *    defecto más común de un sitio hecho con React y el que menos cuesta arreglar.
 *
 * 2. **Los datos del negocio en JSON-LD.** Es lo que hace que un buscador muestre el horario, la
 *    dirección y el teléfono al costado del resultado, en vez de un párrafo cualquiera. Para un
 *    negocio local es lo que más mueve la aguja, y no se ve en la pantalla — así que es de las
 *    cosas que nadie pone si no las pone alguien a propósito.
 *
 * Lo que falta y se dice de frente: **esto sigue siendo una aplicación de una sola página.** Un
 * buscador moderno la ejecuta y la indexa, pero un sitio prerrenderizado carga antes y se indexa
 * mejor. Cuando el sitio sea el canal de captación de verdad, se prerrenderiza; hoy no sería más
 * que trabajo adelantado.
 */

import { useEffect } from 'react';

const SUFIJO = 'Cúspide';

/** Pone el título y la descripción de esta página, y los deja como estaban al salir. */
export function useTitulo(titulo: string, descripcion: string) {
  useEffect(() => {
    const antes = document.title;
    document.title = `${titulo} — ${SUFIJO}`;

    const meta = document.querySelector('meta[name="description"]');
    const descripcionAntes = meta?.getAttribute('content') ?? '';
    meta?.setAttribute('content', descripcion);

    return () => {
      document.title = antes;
      meta?.setAttribute('content', descripcionAntes);
    };
  }, [titulo, descripcion]);
}

/** Deja un bloque JSON-LD en el documento mientras esta pantalla esté montada. */
export function useDatosEstructurados(datos: Record<string, unknown>) {
  useEffect(() => {
    const nodo = document.createElement('script');
    nodo.type = 'application/ld+json';
    nodo.textContent = JSON.stringify(datos);
    document.head.appendChild(nodo);
    return () => nodo.remove();
  }, [datos]);
}
