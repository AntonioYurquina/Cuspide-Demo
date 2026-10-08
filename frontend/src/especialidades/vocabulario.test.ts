/**
 * Ninguna pantalla del núcleo escribe una palabra de especialidad.
 *
 * **Es el test que sostiene el producto entero.** La decisión de fondo (ver el README) es que
 * el núcleo sea idéntico para toda especialidad y que sólo la vertical cambie. Esa separación no
 * se mantiene sola: se mantiene porque alguien escribe «Box» en un encabezado y algo falla.
 *
 * Y el costo de que falle tarde es alto: si las pantallas se escriben hablando en odontólogo, el
 * día que aparezca el primer kinesiólogo hay que reescribirlas, que es justamente lo que este
 * diseño vino a evitar.
 *
 * **Qué se prohíbe y dónde.** Las palabras de cada especialidad, dentro del núcleo —`pages/`,
 * `components/`, `datos/`—. En `especialidades/` están permitidas: es su lugar. Y no se miran
 * los comentarios: un comentario que dice «box» explica, no muestra.
 *
 * **Y `index.html`**, que no está en `src/` y por eso se le escapó: el título de la pestaña decía
 * «gestión odontológica» y sobrevivió al giro a multiespecialidad. Es lo primero que ve alguien
 * que abre el link y lo que le queda en el historial del navegador — el peor lugar donde dejar
 * una palabra que contradice el producto.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ESPECIALIDADES } from './index.ts';

const src = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** El núcleo: lo que tiene que servir igual a cualquier especialidad. */
const NUCLEO = ['pages', 'components', 'datos', 'features', 'documentos', 'publico'];

/**
 * Las palabras de oficio que el núcleo tampoco puede escribir.
 *
 * **Las seis del diccionario no alcanzaban.** El test miraba sólo `profesional`, `recurso` y
 * `unidad` de cada vertical, así que pasaba en verde mientras cinco pantallas decían «depósitos
 * dentales», «de prótesis y ortodoncia» y mandaban «Puente de tres unidades — 24 a 26» a un
 * kinesiólogo. Un producto que se vende como «sirve para cualquier especialidad» y abre en
 * medicina general mostrando eso se cae en la primera demostración.
 *
 * No es una lista exhaustiva y no pretende serlo: es la lista de lo que ya se filtró una vez.
 * Cada palabra nueva entra acá el día que se escape.
 */
const DE_OFICIO = [
  // odontología
  'dental',
  'dentales',
  'odontológic[oa]s?',
  'prótesis',
  'ortodoncia',
  'endodoncia',
  'odontograma',
  'sillón',
  'fluoración',
  'tartrectomía',
  'composite',
  // medicina
  'receta',
  'recetas',
  'anamnesis',
  // kinesiología
  'kinésic[oa]s?',
  'camilla',
  'camillas',
  'magnetoterapia',
  'ultrasonido',
];

/** Lo que sí puede nombrar una especialidad, porque es de ella. */
const PERMITIDO = [
  'especialidades',
  // Dibuja una arcada dental: es de odontología y lo dice.
  'features/auth/Odontograma.tsx',
  // El conmutador muestra los nombres de las tres a propósito, y se borra con la demo.
  'features/demo',
];

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

/**
 * Quita comentarios y rutas de importación antes de buscar.
 *
 * Sin esto el test es inusable: cada comentario que explica por qué existe el vocabulario lo
 * haría fallar, y la reacción sería borrar los comentarios — perdiendo justo lo que hace
 * mantenible el diseño.
 */
function soloCodigoVisible(texto: string): string {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/^\s*import\s[\s\S]*?from\s+'[^']*';?$/gm, ' ');
}

describe('el núcleo no habla el idioma de ninguna especialidad', () => {
  /** Las palabras de las tres, con sus dos formas. */
  const prohibidas = [
    ...new Set(
      Object.values(ESPECIALIDADES).flatMap((e) => [
        e.recurso.singular,
        e.recurso.plural,
        e.unidad.singular,
        e.unidad.plural,
        e.profesional.singular,
        e.profesional.plural,
      ]),
    ),
  ];

  it('hay palabras que vigilar y archivos donde buscarlas', () => {
    expect(prohibidas.length).toBeGreaterThan(10);
    expect(NUCLEO.flatMap((d) => fuentes(join(src, d))).length).toBeGreaterThan(5);
  });

  it('el título y la descripción de la página no nombran una especialidad', () => {
    const html = readFileSync(resolve(src, '..', 'index.html'), 'utf8');
    // Se exigen los dos por separado: juntos, un título largo tapaba que la descripción no
    // existía y el test pasaba igual.
    const titulo = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
    const descripcion = html
      .match(/<meta\s+name="description"\s+content="([^"]*)"/s)?.[1]
      ?.replace(/\s+/g, ' ')
      .trim();
    expect(titulo, 'index.html no tiene <title>').toBeTruthy();
    expect(descripcion, 'index.html no tiene <meta name="description">').toBeTruthy();
    const visible = `${titulo} ${descripcion}`;
    expect(
      prohibidas.filter((p) => new RegExp(`\\b${p}\\b`, 'iu').test(visible)),
      'El título o la descripción de index.html nombran una especialidad.',
    ).toEqual([]);
  });

  it('ninguna palabra de oficio aparece en una pantalla del núcleo', () => {
    const filtrados: string[] = [];

    for (const carpeta of NUCLEO) {
      for (const archivo of fuentes(join(src, carpeta))) {
        const relativa = archivo.slice(src.length + 1);
        if (PERMITIDO.some((p) => relativa.startsWith(p))) continue;

        const codigo = soloCodigoVisible(readFileSync(archivo, 'utf8'));
        for (const palabra of DE_OFICIO) {
          if (new RegExp(`\\b${palabra}\\b`, 'iu').test(codigo)) {
            filtrados.push(`${relativa} → «${palabra}»`);
          }
        }
      }
    }

    expect(
      [...new Set(filtrados)],
      'Estas pantallas del núcleo escriben una palabra de oficio. Si el concepto existe en las ' +
        'tres especialidades pero se llama distinto, va en la vertical (mirá `derivaciones.ts`); ' +
        'si existe en una sola, la pantalla tiene que poder no dibujarse.',
    ).toEqual([]);
  });

  it('ninguna palabra de especialidad aparece en una pantalla del núcleo', () => {
    const filtrados: string[] = [];

    for (const carpeta of NUCLEO) {
      for (const archivo of fuentes(join(src, carpeta))) {
        const relativa = archivo.slice(src.length + 1);
        if (PERMITIDO.some((p) => relativa.startsWith(p))) continue;

        const codigo = soloCodigoVisible(readFileSync(archivo, 'utf8'));
        for (const palabra of prohibidas) {
          // Con límites de palabra y sin distinguir mayúsculas: «Box», «boxes» y «BOX» son la misma falta.
          if (new RegExp(`\\b${palabra}\\b`, 'iu').test(codigo)) {
            filtrados.push(`${relativa} → «${palabra}»`);
          }
        }
      }
    }

    expect(
      [...new Set(filtrados)],
      'Estas pantallas del núcleo nombran una especialidad. Usá `useEspecialidad()` y el ' +
        'vocabulario: el día que aparezca un consultorio de otra especialidad, esto hay que ' +
        'reescribirlo.',
    ).toEqual([]);
  });
});
