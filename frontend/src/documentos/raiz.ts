/**
 * El nodo donde se monta todo lo que se imprime.
 *
 * Vive en su propio archivo porque lo comparten la ficha clínica (`Imprimible`) y el visor de
 * documentos: si cada uno creara el suyo, al imprimir saldrían dos hojas donde se espera una.
 */

/** Crea `#impresion` la primera vez y lo devuelve siempre. */
export function raizDeImpresion(): HTMLElement {
  let raiz = document.getElementById('impresion');
  if (!raiz) {
    raiz = document.createElement('div');
    raiz.id = 'impresion';
    document.body.appendChild(raiz);
  }
  return raiz;
}
