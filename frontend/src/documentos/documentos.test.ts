/**
 * Los documentos que ofrece cada especialidad están completos y no se pisan entre sí.
 *
 * **Qué protege.** Los comunes y los de la vertical se muestran juntos en la misma fila de
 * botones, así que dos con el mismo nombre quedan indistinguibles para quien los usa: el
 * presupuesto de odontología y el presupuesto común serían dos botones iguales, y nadie sabe
 * cuál apretar. Ya estuvo a punto de pasar — odontología listaba «Presupuesto» entre sus
 * documentos cuando el presupuesto ya era común a todas.
 *
 * Y un documento sin componente es un nombre en una lista: una promesa que no imprime nada.
 */

import { describe, expect, it } from 'vitest';
import { ESPECIALIDADES } from '../especialidades/index.ts';
import { COMUNES } from './comunes.tsx';

describe('documentos imprimibles', () => {
  it('los comunes son los cuatro, con su componente', () => {
    expect(COMUNES.length).toBe(4);
    for (const d of COMUNES) {
      expect(d.nombre.length, `«${d.nombre}»`).toBeGreaterThan(3);
      expect(typeof d.Componente, `«${d.nombre}»`).toBe('function');
    }
  });

  it('cada especialidad trae los suyos, con su componente', () => {
    for (const e of Object.values(ESPECIALIDADES)) {
      expect(e.documentos.length, e.nombre).toBeGreaterThanOrEqual(2);
      for (const d of e.documentos) {
        expect(d.nombre.length, `${e.nombre} · «${d.nombre}»`).toBeGreaterThan(3);
        expect(typeof d.Componente, `${e.nombre} · «${d.nombre}»`).toBe('function');
      }
    }
  });

  it('ningún nombre se repite entre los comunes y los de la vertical', () => {
    const choques: string[] = [];
    for (const e of Object.values(ESPECIALIDADES)) {
      const nombres = [...COMUNES, ...e.documentos].map((d) => d.nombre.toLowerCase());
      for (const nombre of new Set(nombres)) {
        if (nombres.filter((n) => n === nombre).length > 1) {
          choques.push(`${e.nombre}: «${nombre}» aparece dos veces`);
        }
      }
    }
    expect(
      choques,
      'Se muestran juntos en la misma fila de botones: dos con el mismo nombre son ' +
        'indistinguibles para quien los usa.',
    ).toEqual([]);
  });

  it('la ficha clínica que cada especialidad anuncia no es también un documento suelto', () => {
    // La ficha se imprime desde la ficha, con su propio botón. Ofrecerla además como documento
    // serían dos caminos al mismo papel, que es como empiezan a divergir.
    for (const e of Object.values(ESPECIALIDADES)) {
      const nombres = [...COMUNES, ...e.documentos].map((d) => d.nombre.toLowerCase());
      expect(nombres, e.nombre).not.toContain(e.fichaClinica.toLowerCase());
    }
  });
});
