/**
 * El visor de documentos: la vista previa y la impresión, que son la misma cosa.
 *
 * El criterio de `HU-012` dice «se ve igual en la vista previa que en el papel». La manera de
 * cumplirlo no es esmerarse en que se parezcan, es que **sean el mismo nodo**: el documento se
 * monta una sola vez, en `#impresion`, y la vista previa lo muestra ahí mismo con un fondo
 * detrás. No hay dos maquetas que mantener sincronizadas, así que no se pueden desincronizar.
 *
 * En pantalla la hoja se dibuja con medidas de papel —210 mm de ancho, 18 mm de margen— y al
 * imprimir sólo se le saca el fondo y la sombra. Eso es todo lo que cambia entre una cosa y la
 * otra.
 */

import { useEffect, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import type { Paciente } from '../datos/consultorio.ts';
import { raizDeImpresion } from './raiz.ts';

export interface Documento {
  nombre: string;
  Componente: ComponentType<{ paciente: Paciente }>;
}

export function VisorDeDocumento({
  documento,
  paciente,
  onCerrar,
}: {
  documento: Documento;
  paciente: Paciente;
  onCerrar: () => void;
}) {
  const [raiz, setRaiz] = useState<HTMLElement | null>(null);
  useEffect(() => setRaiz(raizDeImpresion()), []);

  // Mientras hay un documento abierto, es lo único que se imprime: las fichas que estén montadas
  // detrás tienen su propia hoja en el mismo nodo y saldrían pegadas atrás.
  useEffect(() => {
    document.body.classList.add('viendo-documento');
    return () => document.body.classList.remove('viendo-documento');
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [onCerrar]);

  if (!raiz) return null;

  return createPortal(
    <>
      {/* La barra no va en el papel: lleva `no-imprimir`. */}
      <div className="no-imprimir sticky top-0 z-10 mb-4 flex items-center gap-3 border-b border-gris-300 bg-white px-4 py-2.5">
        <p className="text-sm font-semibold text-gris-900">{documento.nombre}</p>
        <p className="hidden text-xs text-gris-600 sm:block">
          Así sale impreso: lo que ves es la hoja, no una vista aparte.
        </p>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-[9px] bg-marca-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-marca-700"
          >
            Imprimir
          </button>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-[9px] border border-gris-300 px-3 py-1.5 text-sm text-gris-700 transition-colors hover:bg-gris-50"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="hoja hoja-documento">
        <documento.Componente paciente={paciente} />
      </div>
    </>,
    raiz,
  );
}

/** La lista de documentos disponibles, para abrir cualquiera. */
export function BotonesDeDocumento({
  documentos,
  paciente,
}: {
  documentos: Documento[];
  paciente: Paciente;
}) {
  const [abierto, setAbierto] = useState<Documento | null>(null);

  return (
    <div className="no-imprimir">
      <p className="mb-2 text-xs font-semibold tracking-[.08em] text-gris-600 uppercase">
        Documentos
      </p>
      <div className="flex flex-wrap gap-2">
        {documentos.map((d) => (
          <button
            key={d.nombre}
            type="button"
            onClick={() => setAbierto(d)}
            className="rounded-[9px] border border-gris-300 bg-white px-3 py-1.5 text-sm text-gris-700 transition-colors hover:border-marca-300 hover:bg-marca-50 hover:text-marca-800"
          >
            {d.nombre}
          </button>
        ))}
      </div>

      {abierto && (
        <VisorDeDocumento
          documento={abierto}
          paciente={paciente}
          onCerrar={() => setAbierto(null)}
        />
      )}
    </div>
  );
}
