/**
 * El registro de especialidades y cómo se accede a la activa.
 *
 * Una pantalla del núcleo **nunca importa una especialidad**: importa `useEspecialidad()` y
 * pregunta. Así es como el mismo código sirve a un odontólogo y a un kinesiólogo.
 *
 * ```tsx
 * const { e } = useEspecialidad();
 * <th>{may(e.recurso.singular)}</th>   // «Box» · «Consultorio» · «Camilla»
 * ```
 *
 * **Por qué vive en un contexto y no en una constante.** En producción la especialidad se define
 * al alta del consultorio y no cambia. Pero la demo necesita cambiarla **delante del cliente**
 * —es el argumento de venta de todo el producto— y eso exige que sea estado, no configuración.
 * Cuando haya backend, el proveedor lee la especialidad del consultorio y el conmutador se borra:
 * ninguna pantalla se entera.
 */

import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ODONTOLOGIA } from './odontologia.tsx';
import { MEDICINA } from './medicina.tsx';
import { KINESIOLOGIA } from './kinesiologia.tsx';
import type { ClaveEspecialidad, Especialidad } from './tipos.ts';

export type { Especialidad, ClaveEspecialidad, Palabra, ProductoDeTienda } from './tipos.ts';

export const ESPECIALIDADES: Record<ClaveEspecialidad, Especialidad> = {
  odontologia: ODONTOLOGIA,
  medicina: MEDICINA,
  kinesiologia: KINESIOLOGIA,
};

/**
 * La demo abre en medicina general: es la que más gente reconoce, y la que hace que el
 * conmutador se lea como «además sirve para» y no como «esto es de odontólogos» (`D04`).
 */
export const POR_OMISION: ClaveEspecialidad = 'medicina';

const CLAVE_GUARDADA = 'cuspide.especialidad';

interface Contexto {
  e: Especialidad;
  cambiar: (clave: ClaveEspecialidad) => void;
}

const ContextoEspecialidad = createContext<Contexto | null>(null);

export function ProveedorEspecialidad({ children }: { children: ReactNode }) {
  const [clave, setClave] = useState<ClaveEspecialidad>(() => {
    try {
      const guardada = localStorage.getItem(CLAVE_GUARDADA) as ClaveEspecialidad | null;
      return guardada && guardada in ESPECIALIDADES ? guardada : POR_OMISION;
    } catch {
      // Ventana privada o almacenamiento bloqueado: se abre en la de siempre.
      return POR_OMISION;
    }
  });

  const cambiar = useCallback((nueva: ClaveEspecialidad) => {
    setClave(nueva);
    try {
      localStorage.setItem(CLAVE_GUARDADA, nueva);
    } catch {
      /* Sin persistencia el cambio dura lo que dure la pestaña. Alcanza para mostrarlo. */
    }
  }, []);

  const valor = useMemo(() => ({ e: ESPECIALIDADES[clave], cambiar }), [clave, cambiar]);

  return createElement(ContextoEspecialidad.Provider, { value: valor }, children);
}

export function useEspecialidad(): Contexto {
  const ctx = useContext(ContextoEspecialidad);
  if (!ctx) throw new Error('useEspecialidad fuera de <ProveedorEspecialidad>');
  return ctx;
}

/** Primera letra en mayúscula, para arrancar una etiqueta con una palabra del vocabulario. */
export function may(palabra: string): string {
  return palabra.charAt(0).toUpperCase() + palabra.slice(1);
}

/**
 * «1 sesión» · «3 sesiones». El castellano pluraliza de más formas de las que un `+ 's'`
 * resuelve —«sesión» pierde la tilde, «box» suma «es»—, así que las dos formas vienen escritas
 * en la especialidad y acá sólo se elige.
 */
export function contar(cantidad: number, palabra: { singular: string; plural: string }): string {
  return `${cantidad} ${cantidad === 1 ? palabra.singular : palabra.plural}`;
}
