/**
 * Toda pantalla pública tiene su propio título, y el sitio dice dónde queda el centro.
 *
 * **Qué protege.** Una aplicación de una sola página deja el mismo `<title>` en todas las rutas
 * si nadie lo cambia, así que las tres se indexan con el mismo encabezado y compiten entre sí.
 * Es el defecto más común de un sitio hecho con React, no se ve en la pantalla, y la forma en
 * que aparece es siempre la misma: alguien agrega una pantalla pública nueva y se olvida.
 *
 * Y los datos del negocio en JSON-LD son lo que hace que un buscador muestre el horario y la
 * dirección al costado del resultado. Tampoco se ven en la pantalla, así que tampoco se extrañan
 * el día que desaparecen.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const publico = resolve(dirname(fileURLToPath(import.meta.url)));

/** Las pantallas del sitio: las que ve alguien que todavía no es paciente. */
const pantallas = readdirSync(publico).filter(
  (n) => n.startsWith('Pagina') && n.endsWith('.tsx') && !n.includes('.test.'),
);

describe('el sitio público', () => {
  it('hay pantallas públicas que revisar', () => {
    expect(pantallas.length).toBeGreaterThanOrEqual(3);
  });

  it('cada pantalla pone su propio título y su descripción', () => {
    const sinTitulo = pantallas.filter(
      (n) => !/useTitulo\(/.test(readFileSync(join(publico, n), 'utf8')),
    );
    expect(
      sinTitulo,
      'Estas pantallas públicas no llaman a `useTitulo`, así que se indexan con el título de ' +
        'la anterior y compiten entre sí en una búsqueda.',
    ).toEqual([]);
  });

  /**
   * **Que llamen a `useTitulo` no alcanza.**
   *
   * La versión anterior sólo buscaba la cadena `useTitulo(` en cada archivo, así que pasaba en
   * verde con las tres pantallas poniendo el mismo título —que es el defecto que dice prevenir—
   * y también si la llamada estaba comentada. Un test que no puede fallar por el motivo que
   * declara es peor que no tenerlo: da por cubierto algo que no lo está.
   */
  it('los títulos son distintos entre sí y la llamada no está comentada', () => {
    const titulos = new Map<string, string>();
    const comentadas: string[] = [];

    for (const n of pantallas) {
      const fuente = readFileSync(join(publico, n), 'utf8');
      // Sin comentarios: una llamada comentada no pone ningún título.
      const viva = fuente.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ');
      const m = viva.match(/useTitulo\(\s*([^,]+),/);
      if (!m) {
        comentadas.push(n);
        continue;
      }
      titulos.set(n, m[1]!.trim());
    }

    expect(comentadas, 'La llamada a `useTitulo` está comentada en estas pantallas').toEqual([]);

    const repetidos = [...titulos.values()].filter(
      (v, _, todos) => todos.filter((o) => o === v).length > 1,
    );
    expect(
      [...new Set(repetidos)],
      'Dos pantallas públicas ponen el mismo título, que es exactamente el defecto que este ' +
        'archivo dice prevenir: se indexan igual y compiten entre sí.',
    ).toEqual([]);
  });

  it('la portada publica los datos del negocio para los buscadores', () => {
    const fuente = readFileSync(join(publico, 'PaginaSitio.tsx'), 'utf8');
    expect(fuente).toContain('useDatosEstructurados');
    // Lo que un buscador usa para mostrar la ficha del negocio al costado del resultado.
    for (const campo of [
      'MedicalClinic',
      'openingHoursSpecification',
      'PostalAddress',
      'telephone',
    ]) {
      expect(fuente, `falta ${campo} en el JSON-LD`).toContain(campo);
    }
  });
});
