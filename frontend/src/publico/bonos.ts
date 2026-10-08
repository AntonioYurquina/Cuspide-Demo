/**
 * Los bonos comprados en la tienda, que todavía nadie usó.
 *
 * Igual que los turnos pedidos (`pedidos.ts`), viven en `sessionStorage` y se van con la
 * pestaña: `D03` sigue valiendo, acá no persiste nada. Pero `HU-011` pide demostrar que **el
 * bono comprado se refleja como unidades disponibles en la ficha del paciente**, y eso no se
 * cuenta con palabras: hay que comprar uno y abrir la ficha.
 *
 * Antes la compra ni siquiera preguntaba de quién era, así que el criterio no podía cumplirse de
 * ninguna manera. Ahora el checkout pide el paciente —es lo que pasa de verdad en el mostrador:
 * el bono se emite a nombre de alguien— y la ficha lo muestra.
 */

import { useCallback, useEffect, useState } from 'react';

export interface BonoComprado {
  id: string;
  pacienteId: string;
  unidades: number;
  usadas: number;
  comprado: string;
}

const CLAVE = 'cuspide.bonos';
const EVENTO = 'cuspide:bonos';

export function leerBonos(): BonoComprado[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    const datos: unknown = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(datos) ? (datos as BonoComprado[]) : [];
  } catch {
    return [];
  }
}

function guardar(bonos: BonoComprado[]) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(bonos));
  } catch {
    // Que no se pueda guardar no puede romper la pantalla.
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function agregarBono(pacienteId: string, unidades: number, cuando: string) {
  guardar([
    ...leerBonos(),
    {
      id: `bo${leerBonos().length}-${unidades}`,
      pacienteId,
      unidades,
      usadas: 0,
      comprado: cuando,
    },
  ]);
}

/** Los bonos de un paciente, al día. */
export function useBonosDe(pacienteId: string): BonoComprado[] {
  const [bonos, setBonos] = useState<BonoComprado[]>(leerBonos);
  const releer = useCallback(() => setBonos(leerBonos()), []);

  useEffect(() => {
    window.addEventListener(EVENTO, releer);
    window.addEventListener('storage', releer);
    return () => {
      window.removeEventListener(EVENTO, releer);
      window.removeEventListener('storage', releer);
    };
  }, [releer]);

  return bonos.filter((b) => b.pacienteId === pacienteId);
}
