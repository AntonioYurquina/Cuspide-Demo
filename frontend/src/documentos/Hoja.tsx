/**
 * La hoja: lo que sale por la impresora.
 *
 * **Es lo que hace que la demo deje de parecer una maqueta.** Recorrer pantallas impresiona
 * poco; llevarse un papel con el membrete del centro, el nombre del paciente y un lugar para
 * firmar, mucho. Y es lo único de esta etapa que el cliente se lleva puesto.
 *
 * ## Una sola hoja para la vista previa y para el papel
 *
 * El criterio dice «se ve igual en la vista previa que en el papel», y la manera de cumplirlo no
 * es esmerarse en que se parezcan: es que **sean el mismo nodo**. La hoja se monta una sola vez,
 * en `#impresion`, y la vista previa la muestra ahí mismo con un fondo detrás. No hay dos
 * maquetas que mantener sincronizadas, así que no se pueden desincronizar.
 *
 * Las medidas son de papel —210 mm de ancho, márgenes en milímetros— y no de pantalla, por la
 * misma razón.
 */

import type { ReactNode } from 'react';
import { MARCA } from '../marca.ts';
import { fechaCorta, fechaDeDocumento, HOY, type Paciente } from '../datos/consultorio.ts';

/** Los datos del centro. En la etapa dos salen de la configuración; acá son los de la demo. */
export const CENTRO = {
  direccion: 'Av. Belgrano 1247, Salta',
  telefono: '(387) 421-8890',
  correo: 'turnos@centrobelgrano.com.ar',
  cuit: '30-71264518-3',
} as const;

/** El membrete, que es lo que convierte una impresión en un documento del centro. */
export function Membrete({ titulo }: { titulo: string }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-6 border-b-2 border-gris-800 pb-3">
      <div>
        <p className="text-base font-bold tracking-[-.01em] text-gris-900">{MARCA.nombre}</p>
        <p className="mt-0.5 text-xs text-gris-700">
          {CENTRO.direccion} · {CENTRO.telefono}
        </p>
        <p className="text-xs text-gris-700">
          {CENTRO.correo} · CUIT {CENTRO.cuit}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold tracking-[.06em] text-gris-900 uppercase">{titulo}</p>
        <p className="tabular mt-0.5 text-xs text-gris-700">Salta, {fechaDeDocumento(HOY)}</p>
      </div>
    </header>
  );
}

/** Los datos del paciente, que todo documento clínico lleva arriba. */
export function DatosDelPaciente({ paciente }: { paciente: Paciente }) {
  return (
    <dl className="mb-5 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
      {(
        [
          ['Paciente', `${paciente.apellido}, ${paciente.nombre}`],
          ['Documento', `DNI ${paciente.documento}`],
          ['Obra social', paciente.obraSocial],
          ['Afiliado', paciente.afiliado],
        ] as const
      ).map(([rotulo, valor]) => (
        <div key={rotulo} className="flex gap-2 border-b border-gris-200 pb-1">
          <dt className="w-24 shrink-0 text-gris-600">{rotulo}</dt>
          <dd className="font-medium text-gris-900">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * El pie con las firmas.
 *
 * **Un documento clínico sin dónde firmar no se puede usar**, y es lo primero que falta cuando
 * cada pantalla arma su impresión por su cuenta. Por eso está acá y no en cada documento.
 */
export function Firmas({ izquierda, derecha }: { izquierda: string; derecha?: string }) {
  const rotulos = [izquierda, derecha].filter(Boolean) as string[];
  return (
    <footer
      className={`mt-10 flex items-end gap-12 text-center text-xs text-gris-700 ${
        // Una sola firma no ocupa el ancho de la hoja: va a la derecha, como en cualquier papel.
        rotulos.length === 1 ? 'justify-end' : 'justify-between'
      }`}
    >
      {rotulos.map((rotulo) => (
        <div key={rotulo} className={rotulos.length === 1 ? 'w-1/2' : 'flex-1'}>
          <div className="mb-1 h-10 border-b border-gris-800" />
          {rotulo}
        </div>
      ))}
    </footer>
  );
}

/** Un bloque con título, que es como se arma cualquiera de estos documentos. */
export function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-1.5 text-[11px] font-bold tracking-[.1em] text-gris-600 uppercase">
        {titulo}
      </h3>
      <div className="text-sm text-gris-800">{children}</div>
    </section>
  );
}

/** Renglones vacíos para escribir a mano. En el consultorio esto pasa todo el tiempo. */
export function Renglones({ cantidad = 3 }: { cantidad?: number }) {
  return (
    <div className="mt-1 space-y-4">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="border-b border-dotted border-gris-400" />
      ))}
    </div>
  );
}

/**
 * El número del documento. No es fiscal: lo dice, para que nadie lo tome por lo que no es.
 *
 * **Mezcla el nombre de la clase entero, no su largo.** La versión anterior hacía
 * `clase.length * 13`, así que «receta» (6), «alta» (4) e «informe» (7) sólo se distinguían por
 * la cantidad de letras: «orden» y «plan» daban el mismo número, y tres documentos distintos del
 * mismo paciente salían con el mismo N°. Un número que no identifica no sirve para archivar, que
 * es para lo que está.
 */
export function numeroDeDocumento(paciente: Paciente, clase: string): string {
  const semilla = Number(paciente.id.replace(/\D/g, '')) || 1;
  let h = semilla * 2654435761;
  for (const c of clase) h = (h ^ c.charCodeAt(0)) * 16777619;
  const n = Math.abs(h) % 9000;
  return `${String(HOY.getFullYear()).slice(2)}-${String(1000 + n)}`;
}

export { fechaCorta };
