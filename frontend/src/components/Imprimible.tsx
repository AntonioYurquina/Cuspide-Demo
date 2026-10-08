/**
 * Lo que se lleva el paciente en papel.
 *
 * Envuelve cualquier cosa de la pantalla y le agrega un botón de imprimir. Al imprimir sale sólo
 * esto, con un encabezado que en pantalla no está.
 *
 * **Ese encabezado no es decoración.** Una ficha clínica impresa sin el nombre del centro, el
 * del paciente y la fecha no sirve para nada: no se puede archivar, no se puede adjuntar a una
 * autorización y no identifica de quién es. Es lo primero que se pierde cuando cada pantalla
 * resuelve su impresión por su cuenta, así que se resuelve una vez y acá.
 *
 * ## Por qué un portal y no CSS de impresión a secas
 *
 * La versión anterior ocultaba todo con `visibility: hidden` y mostraba sólo lo imprimible. Se
 * ve bien en pantalla al emular impresión y **sale mal en papel**: `visibility` oculta pero
 * **conserva el espacio**, así que el listado de cuarenta pacientes que quedó detrás seguía
 * ocupando su alto y la ficha salía seguida de una hoja y media en blanco. Es de las cosas que
 * sólo se ven generando el PDF, no mirando la pantalla — y así se encontró.
 *
 * Con el portal, lo que se imprime es lo **único** que hay en el documento: el resto de la
 * aplicación se oculta con `display: none`, que sí libera el espacio.
 *
 * La hoja está montada siempre, no sólo mientras dura la impresión. La primera versión la
 * montaba al apretar el botón y la desmontaba con `afterprint`, y era **imposible de verificar**:
 * el navegador dispara `afterprint` de inmediato cuando no hay diálogo, así que al ir a mirar el
 * PDF ya no había nada que mirar. Un mecanismo que sólo existe durante un instante que no se
 * puede observar es un mecanismo que nadie va a poder probar que funciona — y el problema que
 * este componente vino a resolver se encontró justamente generando el PDF.
 *
 * El costo es que el contenido se rinde dos veces. Es una ficha, no un listado: son milisegundos.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MARCA } from '../marca.ts';
import { fechaCorta, HOY } from '../datos/consultorio.ts';
import { raizDeImpresion } from '../documentos/raiz.ts';
import { ContextoPapel } from '../documentos/enPapel.ts';

export function Imprimible({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  // El nodo se resuelve en un efecto porque en el primer render del servidor no hay `document`.
  const [raiz, setRaiz] = useState<HTMLElement | null>(null);
  useEffect(() => setRaiz(raizDeImpresion()), []);

  const hoja = (
    <>
      <header className="mb-4 border-b border-gris-300 pb-3">
        <p className="text-sm font-semibold text-gris-900">{MARCA.nombre}</p>
        <h2 className="mt-1 text-lg font-bold text-gris-900">{titulo}</h2>
        <p className="mt-0.5 text-sm text-gris-700">
          {subtitulo && <span>{subtitulo} · </span>}
          {fechaCorta(HOY)}
        </p>
      </header>
      {children}
    </>
  );

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold tracking-[.08em] text-gris-600 uppercase">{titulo}</p>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-[9px] border border-gris-300 bg-white px-2.5 py-1 text-xs font-medium text-gris-700 transition-colors hover:bg-gris-50"
        >
          Imprimir
        </button>
      </div>

      {children}

      {raiz &&
        createPortal(
          // La copia que se imprime se marca como tal: lo que en pantalla está plegado, en papel
          // va desplegado. Son dos instancias distintas y no comparten estado.
          <ContextoPapel value={true}>
            <div className="hoja">{hoja}</div>
          </ContextoPapel>,
          raiz,
        )}
    </section>
  );
}
