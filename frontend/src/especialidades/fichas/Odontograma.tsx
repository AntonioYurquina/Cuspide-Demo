/**
 * El odontograma: la ficha clínica de odontología.
 *
 * **Es lo único que un odontólogo mira todos los días**, y lo que decide si el sistema es el
 * suyo o el de otro. Por eso se dibuja como se dibuja en el consultorio y no como sería cómodo
 * de programar.
 *
 * Tres decisiones que no son de estilo:
 *
 * 1. **El estado es por cara, no por pieza.** Una muela con caries en la oclusal y una
 *    restauración en la mesial es lo normal, no la excepción. Un odontograma que sólo guarda
 *    «pieza 26: caries» obliga a escribir el detalle en un campo de texto, que es exactamente
 *    lo que estos sistemas vienen a reemplazar. Las caras se llaman como se llaman —mesial es
 *    hacia la línea media, distal hacia afuera— así que **cuál es cuál depende del cuadrante**,
 *    y eso se calcula, no se dibuja a mano cuatro veces.
 *
 * 2. **Cada estado se distingue por color y por forma.** Un odontograma que sólo se lee por
 *    color deja afuera a cerca de uno de cada doce varones, y los odontólogos son personas.
 *    Cada estado tiene su trama o su símbolo: en blanco y negro —impreso, que es como termina
 *    en la historia clínica en papel— se sigue leyendo.
 *
 * 3. **Los menores llevan dentición temporaria.** No es un adorno: un chico de seis años tiene
 *    piezas temporarias y permanentes a la vez, y un odontograma que sólo dibuja 32 piezas no le
 *    sirve al odontólogo que atiende chicos, que son la mitad de la consulta.
 *
 * La numeración es la internacional (FDI): dos dígitos, el primero el cuadrante y el segundo la
 * pieza contando desde la línea media. Es la que se usa en la Argentina y la que espera cualquier
 * profesional.
 */

import { useId } from 'react';
import { edad, type Paciente } from '../../datos/consultorio.ts';
import { Tarjeta } from '../../components/ui.tsx';

// --- El modelo ---------------------------------------------------------------

/** Las caras de una pieza. «Palatina» arriba y «lingual» abajo son la misma cara interna. */
type Cara = 'vestibular' | 'interna' | 'mesial' | 'distal' | 'oclusal';

/** Lo que se registra en una cara. */
type EstadoCara = 'sana' | 'caries' | 'restaurada';

/** Lo que se registra en la pieza entera. */
type EstadoPieza = 'presente' | 'ausente' | 'aExtraer' | 'corona' | 'implante' | 'endodoncia';

interface Pieza {
  /** Número FDI: 11…48 en permanentes, 51…85 en temporarias. */
  numero: number;
  estado: EstadoPieza;
  caras: Partial<Record<Cara, EstadoCara>>;
}

const ESTADOS_CARA: Record<Exclude<EstadoCara, 'sana'>, { etiqueta: string; clase: string }> = {
  caries: { etiqueta: 'Caries', clase: 'fill-rojo-600' },
  restaurada: { etiqueta: 'Restaurada', clase: 'fill-tinta-600' },
};

const ESTADOS_PIEZA: Record<Exclude<EstadoPieza, 'presente'>, string> = {
  ausente: 'Ausente',
  aExtraer: 'A extraer',
  corona: 'Corona',
  implante: 'Implante',
  endodoncia: 'Endodoncia',
};

// --- Los cuadrantes ----------------------------------------------------------
//
// Se listan como se ven en la boca del paciente enfrentado al profesional: el cuadrante 1 es el
// superior derecho del paciente y cae a la IZQUIERDA de la pantalla. Invertirlo es el error
// clásico, y un odontograma espejado es peor que no tener odontograma.

/** Permanentes: 18…11 · 21…28 arriba, 48…41 · 31…38 abajo. */
const PERMANENTES = {
  arriba: [
    [18, 17, 16, 15, 14, 13, 12, 11],
    [21, 22, 23, 24, 25, 26, 27, 28],
  ],
  abajo: [
    [48, 47, 46, 45, 44, 43, 42, 41],
    [31, 32, 33, 34, 35, 36, 37, 38],
  ],
} as const;

/** Temporarias: 55…51 · 61…65 arriba, 85…81 · 71…75 abajo. */
const TEMPORARIAS = {
  arriba: [
    [55, 54, 53, 52, 51],
    [61, 62, 63, 64, 65],
  ],
  abajo: [
    [85, 84, 83, 82, 81],
    [71, 72, 73, 74, 75],
  ],
} as const;

/**
 * Cuándo erupciona cada pieza permanente y cuándo se cae cada temporaria, por posición.
 *
 * **Esto no es un detalle de relleno.** Un chico de cuatro años no tiene ninguna pieza
 * permanente: tiene veinte temporarias. Si la ficha le dibuja un primer molar permanente, el
 * odontólogo que atiende chicos —la mitad de la consulta— cierra la demo ahí mismo. Las edades
 * son las de referencia habituales; el día que haga falta afinarlas se afinan acá.
 */
const ERUPCION_PERMANENTE: Record<number, number> = {
  1: 6, // incisivo central
  2: 7, // incisivo lateral
  3: 11, // canino
  4: 10, // primer premolar
  5: 11, // segundo premolar
  6: 6, // primer molar
  7: 12, // segundo molar
  8: 18, // tercer molar (cordal)
};

const CAIDA_TEMPORARIA: Record<number, number> = {
  1: 7,
  2: 8,
  3: 11,
  4: 10,
  5: 11,
};

/** La posición dentro del cuadrante: el segundo dígito del número FDI. */
const posicion = (numero: number) => numero % 10;

/**
 * Qué piezas tiene en la boca alguien de esta edad.
 *
 * Exportada para poder medirla: es una regla del oficio metida en el código, del tipo que se
 * rompe sin que nada falle —la ficha sigue dibujándose, sólo que con la boca equivocada— y que
 * nadie que no sea odontólogo va a notar mirando la pantalla.
 */
export function denticionDe(años: number): { permanentes: number[]; temporarias: number[] } {
  const permanentes = [...PERMANENTES.arriba.flat(), ...PERMANENTES.abajo.flat()];
  const temporarias = [...TEMPORARIAS.arriba.flat(), ...TEMPORARIAS.abajo.flat()];
  return {
    permanentes: permanentes.filter((n) => años >= ERUPCION_PERMANENTE[posicion(n)]!),
    temporarias: temporarias.filter((n) => años < CAIDA_TEMPORARIA[posicion(n)]!),
  };
}

const cuadrante = (n: number) => Math.floor(n / 10);
const esSuperior = (n: number) => [1, 2, 5, 6].includes(cuadrante(n));
/** El cuadrante 1 y el 4 son los del lado derecho del paciente: caen a la izquierda en pantalla. */
const esIzquierdaEnPantalla = (n: number) => [1, 4, 5, 8].includes(cuadrante(n));

/**
 * Dónde cae cada cara en el dibujo de esta pieza.
 *
 * Es lo que evita cuatro copias del mismo SVG: la vestibular mira hacia afuera de la boca —arriba
 * en las piezas superiores, abajo en las inferiores— y la mesial mira hacia la línea media, que
 * está a la derecha de los cuadrantes de la izquierda de la pantalla y al revés.
 */
function orientacion(numero: number): Record<'arriba' | 'abajo' | 'izq' | 'der', Cara> {
  const vestibularArriba = esSuperior(numero);
  const mesialDerecha = esIzquierdaEnPantalla(numero);
  return {
    arriba: vestibularArriba ? 'vestibular' : 'interna',
    abajo: vestibularArriba ? 'interna' : 'vestibular',
    izq: mesialDerecha ? 'distal' : 'mesial',
    der: mesialDerecha ? 'mesial' : 'distal',
  };
}

// --- Los datos de la demo ----------------------------------------------------

/**
 * Un odontograma verosímil y estable para cada paciente.
 *
 * Determinista a propósito: si el mismo paciente mostrara una boca distinta en cada visita a la
 * pantalla, la demo se caería sola en la primera reunión donde alguien vuelva atrás.
 */
/**
 * Mezcla entera, para que el estado de una pieza no quede correlacionado con su número.
 *
 * La primera versión usaba `semilla * 31 + numero * 7 + i`, que parece aleatorio y no lo es:
 * dentro de un cuadrante el número baja de a uno mientras el índice sube de a uno, así que el
 * valor avanza en paso fijo y los módulos que deciden los hallazgos se sincronizan con la
 * numeración.
 *
 * Medido sobre los cuarenta pacientes, el sesgo no es una propiedad de la población —dos casos
 * de cuarenta— **pero le tocaba al primero**, que es el que se abre en la demo: sus siete
 * hallazgos caían los siete en la arcada inferior y ninguno en la superior. Una boca así existe;
 * lo que no existe es que sea la primera que alguien abre. La mezcla corta la correlación, y lo
 * cubre un test sobre los pacientes que cualquiera abre primero.
 */
function mezclar(x: number): number {
  let n = x | 0;
  n = (n ^ (n >>> 15)) * 0x2c1b3c6d;
  n = (n ^ (n >>> 12)) * 0x297a2d39;
  return Math.abs(n ^ (n >>> 15));
}

export function odontogramaDe(paciente: Paciente, numeros: number[]): Pieza[] {
  const semilla = Number(paciente.id.replace(/\D/g, '')) || 1;

  return numeros.map((numero) => {
    const n = mezclar(semilla * 100 + numero);
    const caras: Pieza['caras'] = {};

    // La mayoría de las piezas están sanas. Una boca con todo marcado no la tiene nadie y se
    // lee como datos de relleno.
    if (n % 6 === 0) caras.oclusal = n % 12 === 0 ? 'caries' : 'restaurada';
    if (n % 17 === 0) caras.mesial = 'caries';
    if (n % 19 === 0) caras.distal = 'restaurada';
    if (n % 23 === 0) caras.vestibular = 'caries';

    let estado: EstadoPieza = 'presente';
    // Los terceros molares —las piezas 8— son las que más faltan, y es lo que espera ver alguien
    // que mira un odontograma de verdad.
    if (numero % 10 === 8 && n % 3 === 0) estado = 'ausente';
    else if (n % 29 === 0) estado = 'aExtraer';
    else if (n % 23 === 0) estado = 'corona';
    else if (n % 37 === 0) estado = 'implante';
    else if (n % 19 === 0) estado = 'endodoncia';

    return { numero, estado, caras: estado === 'ausente' ? {} : caras };
  });
}

// --- El dibujo ---------------------------------------------------------------

const LADO = 34;
const M = LADO / 2;
/** La cara oclusal ocupa el centro; las otras cuatro son los trapecios que la rodean. */
const C = LADO * 0.3;

function claseDe(estado: EstadoCara | undefined): string {
  if (!estado || estado === 'sana') return 'fill-white';
  return ESTADOS_CARA[estado].clase;
}

/**
 * La trama que hace legible el estado sin depender del color.
 *
 * **Los identificadores son únicos por instancia**, y eso no es prolijidad: `Imprimible` monta
 * la ficha dos veces —la de la pantalla y la de la hoja—, así que con un `id` fijo había dos
 * `<pattern id="trama-caries">` en el documento. El navegador resuelve `url(#…)` contra el
 * primero, que es el de la pantalla, y en impresión ese árbol está en `display: none`: un
 * patrón dentro de un subárbol oculto no se dibuja, así que **las tramas desaparecían justo al
 * imprimir**, que es donde `HU-005` las exige. Se veía perfecto en la pantalla.
 */
function tramaDe(prefijo: string, estado: EstadoCara | undefined): string | undefined {
  if (estado === 'caries') return `url(#${prefijo}-caries)`;
  if (estado === 'restaurada') return `url(#${prefijo}-restaurada)`;
  return undefined;
}

function CaraSVG({
  puntos,
  estado,
  prefijo,
}: {
  puntos: string;
  estado: EstadoCara | undefined;
  prefijo: string;
}) {
  const trama = tramaDe(prefijo, estado);
  return (
    <>
      <polygon points={puntos} className={`${claseDe(estado)} stroke-gris-400`} strokeWidth="0.7" />
      {trama && <polygon points={puntos} fill={trama} />}
    </>
  );
}

/** Las definiciones de trama, **dentro de cada SVG que las usa**, con su prefijo propio. */
function Tramas({ prefijo }: { prefijo: string }) {
  return (
    <defs>
      <pattern
        id={`${prefijo}-caries`}
        width="4"
        height="4"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="4" stroke="white" strokeWidth="1.6" />
      </pattern>
      <pattern id={`${prefijo}-restaurada`} width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.9" fill="white" />
      </pattern>
    </defs>
  );
}

function PiezaSVG({ pieza }: { pieza: Pieza }) {
  // Un prefijo por pieza. Son definiciones minúsculas y es lo que garantiza que la trama viva
  // dentro del mismo subárbol que la usa, se dibuje en la pantalla o en la hoja.
  const prefijo = useId().replace(/:/g, '');
  const o = orientacion(pieza.numero);
  const c = pieza.caras;
  const ausente = pieza.estado === 'ausente';

  return (
    <svg
      viewBox={`-3 -3 ${LADO + 6} ${LADO + 6}`}
      className="w-full"
      role="img"
      aria-label={descripcion(pieza)}
    >
      <Tramas prefijo={prefijo} />
      {!ausente && (
        <>
          <CaraSVG
            puntos={`0,0 ${LADO},0 ${LADO - C},${C} ${C},${C}`}
            estado={c[o.arriba]}
            prefijo={prefijo}
          />
          <CaraSVG
            puntos={`0,${LADO} ${LADO},${LADO} ${LADO - C},${LADO - C} ${C},${LADO - C}`}
            estado={c[o.abajo]}
            prefijo={prefijo}
          />
          <CaraSVG
            puntos={`0,0 ${C},${C} ${C},${LADO - C} 0,${LADO}`}
            estado={c[o.izq]}
            prefijo={prefijo}
          />
          <CaraSVG
            puntos={`${LADO},0 ${LADO - C},${C} ${LADO - C},${LADO - C} ${LADO},${LADO}`}
            estado={c[o.der]}
            prefijo={prefijo}
          />
          <CaraSVG
            puntos={`${C},${C} ${LADO - C},${C} ${LADO - C},${LADO - C} ${C},${LADO - C}`}
            estado={c.oclusal}
            prefijo={prefijo}
          />
        </>
      )}

      {/* Los estados de la pieza entera van encima, cada uno con su forma propia. */}
      {ausente && (
        <g className="stroke-gris-500" strokeWidth="2.4" strokeLinecap="round">
          <line x1="2" y1="2" x2={LADO - 2} y2={LADO - 2} />
          <line x1={LADO - 2} y1="2" x2="2" y2={LADO - 2} />
        </g>
      )}
      {pieza.estado === 'aExtraer' && (
        <g className="stroke-rojo-600" strokeWidth="2.4" strokeLinecap="round">
          <line x1="2" y1="2" x2={LADO - 2} y2={LADO - 2} />
          <line x1={LADO - 2} y1="2" x2="2" y2={LADO - 2} />
        </g>
      )}
      {pieza.estado === 'corona' && (
        <circle
          cx={M}
          cy={M}
          r={M + 1.5}
          className="fill-none stroke-purpura-600"
          strokeWidth="2.2"
        />
      )}
      {pieza.estado === 'implante' && (
        <g className="stroke-purpura-700" strokeWidth="2" strokeLinecap="round">
          <line x1={M} y1="3" x2={M} y2={LADO - 3} />
          <line x1={M - 6} y1={M - 6} x2={M + 6} y2={M - 6} />
          <line x1={M - 6} y1={M} x2={M + 6} y2={M} />
          <line x1={M - 6} y1={M + 6} x2={M + 6} y2={M + 6} />
        </g>
      )}
      {pieza.estado === 'endodoncia' && (
        <polygon
          points={`${M},${LADO - 2} ${M - 6},4 ${M + 6},4`}
          className="fill-ambar-600/85 stroke-ambar-800"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}

/** El texto que lee quien no ve el dibujo. Sin esto la ficha es una imagen muda. */
function descripcion(pieza: Pieza): string {
  const partes: string[] = [`Pieza ${pieza.numero}`];
  if (pieza.estado !== 'presente') partes.push(ESTADOS_PIEZA[pieza.estado]);
  for (const [cara, estado] of Object.entries(pieza.caras)) {
    if (estado && estado !== 'sana') partes.push(`${cara}: ${ESTADOS_CARA[estado].etiqueta}`);
  }
  return partes.length === 1 ? `Pieza ${pieza.numero}, sana` : partes.join(' · ');
}

function Arcada({ piezas, mitades }: { piezas: Pieza[]; mitades: readonly (readonly number[])[] }) {
  const por = new Map(piezas.map((p) => [p.numero, p]));
  // Sin ninguna pieza presente, la fila son dieciséis recuadros punteados que no informan nada.
  if (!mitades.flat().some((n) => por.has(n))) return null;
  return (
    <div className="flex justify-center gap-3">
      {mitades.map((mitad, i) => (
        <div key={i} className="flex gap-[3px]">
          {mitad.map((numero) => {
            const pieza = por.get(numero);
            return (
              <div key={numero} className="w-[30px] sm:w-[34px]">
                {pieza ? (
                  <PiezaSVG pieza={pieza} />
                ) : (
                  // Sin erupcionar o ya caída: el lugar queda, porque una arcada que se junta
                  // deja de decir dónde falta cada cosa.
                  <span
                    className="block aspect-square rounded-[3px] border border-dashed border-gris-300"
                    title={`Pieza ${numero}: sin erupcionar`}
                  />
                )}
                <p
                  className={`tabular mt-0.5 text-center text-[10px] ${pieza ? 'text-gris-600' : 'text-gris-400'}`}
                >
                  {numero}
                </p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// --- La ficha ----------------------------------------------------------------

export function Odontograma({ paciente }: { paciente: Paciente }) {
  const años = edad(paciente);
  const prefijoLeyenda = useId().replace(/:/g, '');
  // Las que ya erupcionaron y las que todavía no se cayeron. A los 4 años esto da veinte
  // temporarias y ninguna permanente; a los 8, las dos cosas; a los 20, sólo permanentes.
  const { permanentes: numerosPermanentes, temporarias: numerosTemporarias } = denticionDe(años);
  const conTemporarias = numerosTemporarias.length > 0;

  const piezas = odontogramaDe(paciente, numerosPermanentes);
  const piezasTemporarias = odontogramaDe(paciente, numerosTemporarias);

  const marcadas = [...piezas, ...piezasTemporarias].filter(
    (p) => p.estado !== 'presente' || Object.values(p.caras).some((e) => e && e !== 'sana'),
  );

  return (
    <div className="space-y-4">
      <Tarjeta className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-gris-800">Odontograma</h3>
          <p className="text-xs text-gris-600">
            {años} años · numeración internacional (FDI) ·{' '}
            {/* Mixta es tener las dos a la vez, no ser menor: a los 4 años es temporaria pura. */}
            {conTemporarias
              ? numerosPermanentes.length > 0
                ? 'dentición mixta'
                : 'dentición temporaria'
              : 'dentición permanente'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[560px] space-y-4">
            <Arcada piezas={piezas} mitades={PERMANENTES.arriba} />
            <Arcada piezas={piezasTemporarias} mitades={TEMPORARIAS.arriba} />
            <hr className="border-gris-200" />
            <Arcada piezas={piezasTemporarias} mitades={TEMPORARIAS.abajo} />
            <Arcada piezas={piezas} mitades={PERMANENTES.abajo} />
          </div>
        </div>
      </Tarjeta>

      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta className="p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-gris-800">Referencias</h3>
          <ul className="grid gap-2 text-sm text-gris-700 sm:grid-cols-2">
            {(
              [
                ['caries', 'Caries'],
                ['restaurada', 'Restaurada'],
              ] as const
            ).map(([estado, texto]) => (
              <li key={estado} className="flex items-center gap-2">
                <svg viewBox="-1 -1 22 22" className="size-5 shrink-0" aria-hidden="true">
                  <Tramas prefijo={`${prefijoLeyenda}-${estado}`} />
                  <rect
                    width="20"
                    height="20"
                    className={`${claseDe(estado)} stroke-gris-400`}
                    strokeWidth="1"
                  />
                  <rect
                    width="20"
                    height="20"
                    fill={tramaDe(`${prefijoLeyenda}-${estado}`, estado)}
                  />
                </svg>
                {texto}
              </li>
            ))}
            {(
              [
                ['ausente', 'Ausente'],
                ['aExtraer', 'A extraer'],
                ['corona', 'Corona'],
                ['implante', 'Implante'],
                ['endodoncia', 'Endodoncia'],
              ] as const
            ).map(([estado, texto]) => (
              <li key={estado} className="flex items-center gap-2">
                <span className="block size-5 shrink-0">
                  <PiezaSVG pieza={{ numero: 11, estado, caras: {} }} />
                </span>
                {texto}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gris-600">
            Cada estado tiene su forma además de su color: impreso en blanco y negro se sigue
            leyendo.
          </p>
        </Tarjeta>

        <Tarjeta className="p-4 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-gris-800">
            Hallazgos <span className="font-normal text-gris-500">({marcadas.length} piezas)</span>
          </h3>
          {marcadas.length === 0 ? (
            <p className="text-sm text-gris-600">Boca sana: ninguna pieza con hallazgos.</p>
          ) : (
            <ul className="space-y-1 text-sm text-gris-700">
              {marcadas.map((p) => (
                <li key={p.numero}>
                  <span className="tabular font-medium text-gris-900">{p.numero}</span>{' '}
                  <span className="text-gris-600">
                    {descripcion(p).replace(/^Pieza \d+ ?·? ?/, '')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
