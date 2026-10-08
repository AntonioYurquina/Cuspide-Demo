/**
 * Toda clase de color que se usa en una pantalla existe en la paleta.
 *
 * **Por qué se mide.** Tailwind v4 arma las clases a partir de los tokens de `@theme`. Una
 * clase que apunta a un token inexistente —`bg-purpura-200` sin `--color-purpura-200`— **no
 * genera CSS y no genera error**: compila, el build pasa, el test pasa, y en la pantalla el
 * elemento queda sin ese color. Nadie se entera salvo quien lo mire de cerca.
 *
 * Pasó acá, y en el peor lugar posible: el distintivo «Pedido por el paciente» de la agenda
 * —que es el argumento de venta de `HU-010`, el que demuestra que el turno entra solo— salía
 * sin borde ni color de texto. Y el símbolo de implante del odontograma, que `HU-005` pide que
 * se distinga por forma además de por color, se dibujaba sin trazo: **invisible**.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const src = resolve(dirname(fileURLToPath(import.meta.url)));

/** Las familias de color del producto. Las de Tailwind por omisión no se usan. */
const FAMILIAS = ['marca', 'tinta', 'gris', 'rojo', 'ambar', 'purpura'];

/** Las utilidades que toman un color. */
const UTILIDADES =
  'bg|text|border|stroke|fill|ring|outline|divide|accent|from|via|to|shadow|caret|decoration|placeholder';

function fuentes(dir: string): string[] {
  const salida: string[] = [];
  const recorrer = (d: string) => {
    for (const entrada of readdirSync(d)) {
      const ruta = join(d, entrada);
      if (statSync(ruta).isDirectory()) recorrer(ruta);
      else if (/\.tsx?$/.test(entrada) && !/\.test\.tsx?$/.test(entrada)) salida.push(ruta);
    }
  };
  recorrer(dir);
  return salida;
}

describe('la paleta', () => {
  const css = readFileSync(join(src, 'estilos.css'), 'utf8');
  const definidos = new Set([...css.matchAll(/--color-([a-z]+-[a-z0-9]+):/g)].map((m) => m[1]!));

  it('hay tokens de color definidos', () => {
    expect(definidos.size).toBeGreaterThan(30);
  });

  it('ninguna pantalla usa un color que no existe', () => {
    const re = new RegExp(`\\b(?:${UTILIDADES})-((?:${FAMILIAS.join('|')})-[a-z0-9]+)\\b`, 'g');
    const huerfanos: string[] = [];

    for (const archivo of fuentes(src)) {
      const relativa = archivo.slice(src.length + 1);
      for (const m of readFileSync(archivo, 'utf8').matchAll(re)) {
        const token = m[1]!;
        if (!definidos.has(token)) huerfanos.push(`${relativa} → ${token}`);
      }
    }

    expect(
      [...new Set(huerfanos)],
      'Estas clases no generan CSS: el token no existe en el @theme de estilos.css. No dan ' +
        'error, simplemente el elemento queda sin ese color.',
    ).toEqual([]);
  });
});
