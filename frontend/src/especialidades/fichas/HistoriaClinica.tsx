/**
 * La historia clínica: la ficha de medicina general.
 *
 * Es la vertical que más gente reconoce y la que abre la demo. Si un clínico no ve su forma de
 * registrar, ninguna otra pantalla lo convence.
 *
 * Tres decisiones que valen más que el dibujo:
 *
 * 1. **Alergias y antecedentes están siempre arriba, no en una pestaña.** Es lo único de la
 *    ficha que, si pasa desapercibido, hace daño. Una alergia a la penicilina escondida detrás
 *    de un clic es una alergia que alguien no va a ver el día que esté apurado, y la historia
 *    clínica existe sobre todo para ese día.
 *
 * 2. **Los signos vitales avisan cuando caen fuera de rango, y el rango depende de la edad.**
 *    Una frecuencia cardíaca de 110 es alarma en un adulto y normalidad en un chico de cuatro
 *    años. Un sistema que marca en rojo lo segundo enseña a ignorar el rojo, que es peor que no
 *    marcar nada.
 *
 * 3. **El diagnóstico se elige de un catálogo, no se escribe libre.** Texto libre significa
 *    «HTA», «hipertensión», «Hipertensión arterial» y «hta» conviviendo, y con eso no se cuenta
 *    nada: ni cuántos hipertensos hay, ni a quién llamar cuando cambie un protocolo. El catálogo
 *    de acá es una muestra; el día que haga falta CIE-10 completo, lo que cambia es la lista.
 */

import { useMemo, useState } from 'react';
import { edad, fechaCorta, mezclar, type Paciente } from '../../datos/consultorio.ts';
import { Entrada, Tarjeta } from '../../components/ui.tsx';
import { useEnPapel } from '../../documentos/enPapel.ts';

// --- Catálogo de diagnósticos ------------------------------------------------
//
// Una muestra con el código que le corresponde en CIE-10. El código importa: es lo que hace que
// «hipertensión esencial» sea la misma cosa acá, en la obra social y en la estadística.

const DIAGNOSTICOS = [
  { codigo: 'I10', texto: 'Hipertensión esencial (primaria)' },
  { codigo: 'E11', texto: 'Diabetes mellitus tipo 2' },
  { codigo: 'E78.5', texto: 'Dislipidemia, no especificada' },
  { codigo: 'J00', texto: 'Rinofaringitis aguda (resfrío común)' },
  { codigo: 'J20', texto: 'Bronquitis aguda' },
  { codigo: 'J45', texto: 'Asma' },
  { codigo: 'K21', texto: 'Enfermedad por reflujo gastroesofágico' },
  { codigo: 'K59.0', texto: 'Constipación' },
  { codigo: 'M54.5', texto: 'Lumbalgia' },
  { codigo: 'M79.1', texto: 'Mialgia' },
  { codigo: 'N39.0', texto: 'Infección de vías urinarias, sitio no especificado' },
  { codigo: 'R51', texto: 'Cefalea' },
  { codigo: 'F41.1', texto: 'Trastorno de ansiedad generalizada' },
  { codigo: 'E66', texto: 'Obesidad' },
  { codigo: 'D50', texto: 'Anemia por deficiencia de hierro' },
  { codigo: 'L20', texto: 'Dermatitis atópica' },
  { codigo: 'H10', texto: 'Conjuntivitis' },
  { codigo: 'Z00.0', texto: 'Examen médico general' },
] as const;

const ALERGIAS = [
  'Penicilina',
  'AINEs',
  'Látex',
  'Yodo',
  'Sulfamidas',
  'Frutos secos',
  'Polen',
] as const;

/** Los antecedentes, marcados por edad: un chico no tiene tabaquismo ni fractura de cadera. */
const ANTECEDENTES = [
  { texto: 'Hipertensión arterial', adulto: true },
  { texto: 'Diabetes tipo 2', adulto: true },
  { texto: 'Tabaquismo', adulto: true },
  { texto: 'Asma', adulto: false },
  { texto: 'Hipotiroidismo', adulto: true },
  { texto: 'Cirugía de vesícula', adulto: true },
  { texto: 'Fractura de cadera', adulto: true },
  { texto: 'Dislipidemia', adulto: true },
  { texto: 'Bronquiolitis en el primer año', adulto: false },
  { texto: 'Dermatitis atópica', adulto: false },
] as const;

/**
 * Los cuadros, **con el motivo, el examen y las indicaciones de la misma consulta**, y marcados
 * por edad.
 *
 * Antes eran tres listas sueltas que se sorteaban por separado, y salían consultas que no
 * existen: un examen abdominal para un motivo de tos, un reposo de 48 horas para un control
 * periódico. Peor todavía con los ocho menores de la lista, que recibían lumbalgia de tres
 * semanas e ibuprofeno de 400 mg cada ocho horas — una nena de cuatro años. Cada dato por
 * separado era correcto; el conjunto se leía inventado, que es lo único que importa en una
 * demostración.
 */
const CUADROS = [
  {
    adulto: true,
    motivo: 'Control periódico',
    examen:
      'Buen estado general, lúcido, hidratado. Ruidos cardíacos normales, sin soplos. Buena entrada de aire bilateral.',
    indicaciones: ['Laboratorio completo con perfil lipídico', 'Control en 12 meses'],
  },
  {
    adulto: true,
    motivo: 'Dolor lumbar de tres semanas',
    examen:
      'Dolor a la palpación de musculatura paravertebral lumbar. Lasègue negativo bilateral. Sin déficit motor.',
    indicaciones: ['Kinesiología, 10 sesiones', 'Evitar levantar peso', 'Control en 3 semanas'],
  },
  {
    adulto: true,
    motivo: 'Control de presión arterial',
    examen: 'Buen estado general. Ruidos cardíacos normales. Sin edemas en miembros inferiores.',
    indicaciones: ['Continuar tratamiento habitual', 'Registro domiciliario de presión arterial'],
  },
  {
    adulto: true,
    motivo: 'Certificado de aptitud física',
    examen:
      'Examen cardiovascular y respiratorio sin particularidades. Aparato locomotor conservado.',
    indicaciones: ['Apto para actividad física', 'Hidratación y entrada en calor'],
  },
  {
    adulto: false,
    motivo: 'Control de niño sano',
    examen:
      'Buen estado general. Peso y talla en percentiles acordes a la edad. Auscultación cardiopulmonar normal.',
    indicaciones: ['Calendario de vacunación al día', 'Control en 6 meses'],
  },
  {
    adulto: false,
    motivo: 'Tos y fiebre de 48 horas',
    examen:
      'Orofaringe congestiva. Adenopatías submaxilares dolorosas. Auscultación pulmonar sin agregados.',
    indicaciones: [
      'Paracetamol 15 mg/kg cada 6 horas si hay fiebre',
      'Abundante líquido y reposo',
      'Pautas de alarma: dificultad para respirar o fiebre que persiste 72 horas',
    ],
  },
  {
    adulto: false,
    motivo: 'Dolor de oído',
    examen:
      'Otoscopía: tímpano derecho congestivo, sin otorrea. Resto del examen sin particularidades.',
    indicaciones: ['Analgesia según peso', 'Control en 48 horas si no cede'],
  },
] as const;

// --- Signos vitales y sus rangos ---------------------------------------------

interface Base {
  clave: string;
  etiqueta: string;
  unidad: string;
}

/**
 * Un signo vital y su rango normal para la edad de este paciente.
 *
 * Unión discriminada y no `number | [number, number]`: la presión arterial son dos valores con
 * dos rangos y el resto es uno solo. Sin el discriminante, cada lectura termina en un `as` y el
 * tipo deja de proteger nada.
 */
type Signo =
  | (Base & { tipo: 'simple'; valor: number; rango: [number, number] })
  | (Base & { tipo: 'par'; valor: [number, number]; rango: [[number, number], [number, number]] });

/** Si el valor —o cualquiera de los dos, en la presión— cae fuera de su rango. */
function enAlerta(s: Signo): boolean {
  return s.tipo === 'par'
    ? fuera(s.valor[0], s.rango[0]) || fuera(s.valor[1], s.rango[1])
    : fuera(s.valor, s.rango);
}

/**
 * Los rangos normales, por edad.
 *
 * Están en un solo lugar y separados del dibujo a propósito: el día que un protocolo los cambie
 * —pasa— se cambian acá y no en once lugares de la pantalla.
 */
function rangosDe(años: number) {
  const chico = años < 12;
  return {
    presion: chico
      ? ([
          [90, 115],
          [55, 75],
        ] as [[number, number], [number, number]])
      : ([
          [100, 139],
          [60, 89],
        ] as [[number, number], [number, number]]),
    pulso: chico ? ([70, 120] as [number, number]) : ([60, 100] as [number, number]),
    temperatura: [36, 37.4] as [number, number],
    saturacion: [95, 100] as [number, number],
    respiratoria: chico ? ([18, 30] as [number, number]) : ([12, 20] as [number, number]),
  };
}

function fuera(valor: number, [min, max]: [number, number]): boolean {
  return valor < min || valor > max;
}

// --- Los datos de la demo ----------------------------------------------------

interface Consulta {
  id: string;
  fecha: Date;
  motivo: string;
  examen: string;
  diagnostico: (typeof DIAGNOSTICOS)[number];
  indicaciones: string[];
  signos: Signo[];
}

function historiaDe(paciente: Paciente): Consulta[] {
  const semilla = Number(paciente.id.replace(/\D/g, '')) || 1;
  const años = edad(paciente);
  const r = rangosDe(años);

  return Array.from({ length: 4 }, (_, i) => {
    const n = mezclar(semilla * 1013 + i * 29);
    // El cuadro entero —motivo, examen e indicaciones— y acorde a la edad del paciente.
    const posibles = CUADROS.filter((c) => c.adulto === años >= 15);
    const cuadro = posibles[n % posibles.length]!;
    /**
     * Un valor fuera de rango cada tanto: una ficha donde todo está siempre normal no demuestra
     * el aviso, que es justamente lo que hay que mostrar.
     *
     * **Cada signo se sortea con su propia mezcla.** La versión anterior sacaba el término base
     * y la decisión de desviarse de la misma cuenta —`n % 5` para los dos—, así que cuando
     * tocaba desvío el término base valía 0 y se anulaban. La frecuencia respiratoria **no podía
     * salir de rango nunca**: en las 160 consultas sembradas daba siempre entre 13 y 19, dentro
     * de 12–20. Un aviso que no puede dispararse es un criterio que no se cumple.
     */
    const dado = (k: number, modulo: number) => mezclar(n * 31 + k * 7919) % modulo;
    const seDesvia = (k: number) => dado(k, 100) < 18;

    const sistolica = r.presion[0][0] + dado(1, 28) + (seDesvia(11) ? 30 : 0);
    const diastolica = r.presion[1][0] + dado(2, 18) + (seDesvia(12) ? 16 : 0);
    const pulso = r.pulso[0] + dado(3, 26) + (seDesvia(13) ? 26 : 0);
    const temperatura = Number((36.2 + dado(4, 9) / 10 + (seDesvia(14) ? 1.6 : 0)).toFixed(1));
    const saturacion = 99 - dado(5, 4) - (seDesvia(15) ? 7 : 0);
    const respiratoria = r.respiratoria[0] + dado(6, 5) + (seDesvia(16) ? 9 : 0);

    return {
      id: `c${paciente.id}-${i}`,
      fecha: new Date(
        paciente.ultimaVisita.getFullYear(),
        paciente.ultimaVisita.getMonth() - i * 3,
        paciente.ultimaVisita.getDate(),
      ),
      motivo: cuadro.motivo,
      examen: cuadro.examen,
      diagnostico: DIAGNOSTICOS[n % DIAGNOSTICOS.length]!,
      indicaciones: [...cuadro.indicaciones],
      signos: [
        {
          tipo: 'par',
          clave: 'presion',
          etiqueta: 'Presión arterial',
          unidad: 'mmHg',
          valor: [sistolica, diastolica],
          rango: r.presion,
        },
        {
          tipo: 'simple',
          clave: 'pulso',
          etiqueta: 'Pulso',
          unidad: 'lpm',
          valor: pulso,
          rango: r.pulso,
        },
        {
          tipo: 'simple',
          clave: 'temperatura',
          etiqueta: 'Temperatura',
          unidad: '°C',
          valor: temperatura,
          rango: r.temperatura,
        },
        {
          tipo: 'simple',
          clave: 'saturacion',
          etiqueta: 'Saturación',
          unidad: '%',
          valor: saturacion,
          rango: r.saturacion,
        },
        {
          tipo: 'simple',
          clave: 'respiratoria',
          etiqueta: 'Frec. respiratoria',
          unidad: 'rpm',
          valor: respiratoria,
          rango: r.respiratoria,
        },
      ],
    };
  });
}

function perfilDe(paciente: Paciente) {
  const semilla = Number(paciente.id.replace(/\D/g, '')) || 1;
  const años = edad(paciente);
  return {
    alergias: ALERGIAS.filter((_, i) => mezclar(semilla * 139 + i * 71) % 9 === 0),
    antecedentes: ANTECEDENTES.filter(
      (a, i) => a.adulto === años >= 15 && mezclar(semilla * 181 + i * 53) % 4 === 0,
    ).map((a) => a.texto),
  };
}

// --- El dibujo ---------------------------------------------------------------

function SignoVital({ signo }: { signo: Signo }) {
  const alerta = enAlerta(signo);
  const texto = signo.tipo === 'par' ? signo.valor.join('/') : String(signo.valor);
  const normal =
    signo.tipo === 'par'
      ? `${signo.rango[0].join('–')} / ${signo.rango[1].join('–')}`
      : signo.rango.join('–');

  return (
    <div
      className={`rounded-[9px] border px-3 py-2 ${
        alerta ? 'border-rojo-100 bg-rojo-50' : 'border-gris-200 bg-gris-50'
      }`}
    >
      <p className="text-[11px] font-semibold tracking-[.06em] text-gris-600 uppercase">
        {signo.etiqueta}
      </p>
      <p className="mt-0.5 flex items-baseline gap-1.5">
        <span
          className={`tabular text-lg font-semibold ${alerta ? 'text-rojo-800' : 'text-gris-900'}`}
        >
          {texto}
        </span>
        <span className="text-xs text-gris-600">{signo.unidad}</span>
        {alerta && (
          <span
            className="ml-auto rounded-full bg-rojo-600 px-2 py-0.5 text-[10px] font-semibold text-white"
            /* El texto va además del color: en blanco y negro el fondo rojo no se distingue. */
          >
            Fuera de rango
          </span>
        )}
      </p>
      <p className="tabular mt-0.5 text-[11px] text-gris-500">Normal {normal}</p>
    </div>
  );
}

/** Minúsculas y sin diacríticos, la misma regla que usa la búsqueda de pacientes. */
function sinAcentos(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function BuscadorDiagnostico() {
  const [texto, setTexto] = useState('');
  const criterio = sinAcentos(texto.trim());
  const encontrados = useMemo(
    () =>
      criterio
        ? DIAGNOSTICOS.filter(
            (d) =>
              sinAcentos(d.texto).includes(criterio) || sinAcentos(d.codigo).includes(criterio),
          ).slice(0, 6)
        : [],
    [criterio],
  );

  return (
    <div>
      <Entrada
        type="search"
        aria-label="Buscar un diagnóstico en el catálogo"
        placeholder="Buscar diagnóstico o código — probá «hiper» o «J45»"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      {criterio && (
        <ul className="mt-2 divide-y divide-gris-100 rounded-[9px] border border-gris-200">
          {encontrados.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-gris-600">
              Ninguno coincide. El catálogo de la demo tiene {DIAGNOSTICOS.length} diagnósticos.
            </li>
          ) : (
            encontrados.map((d) => (
              <li key={d.codigo} className="flex items-baseline gap-3 px-3 py-2 text-sm">
                <span className="tabular w-14 shrink-0 font-semibold text-marca-700">
                  {d.codigo}
                </span>
                <span className="text-gris-800">{d.texto}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function HistoriaClinica({ paciente }: { paciente: Paciente }) {
  const años = edad(paciente);
  const { alergias, antecedentes } = perfilDe(paciente);
  const consultas = historiaDe(paciente);
  const [abierta, setAbierta] = useState(consultas[0]?.id ?? null);
  // En papel va todo: una historia clínica impresa con una de cuatro consultas no se archiva.
  const enPapel = useEnPapel();

  return (
    <div className="space-y-4">
      {/* Lo que no puede pasar desapercibido va primero y sin plegar. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta
          className={`p-4 sm:p-5 ${alergias.length > 0 ? 'border-rojo-600 bg-rojo-50' : ''}`}
        >
          <h3
            className={`flex items-center gap-2 text-sm font-semibold ${
              alergias.length > 0 ? 'text-rojo-800' : 'text-gris-800'
            }`}
          >
            {alergias.length > 0 && (
              <svg viewBox="0 0 20 20" className="size-4 shrink-0" aria-hidden="true">
                <path
                  d="M10 2 1 18h18L10 2Z"
                  className="fill-rojo-600/15 stroke-rojo-700"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 8v4.5M10 15h.01"
                  className="stroke-rojo-700"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
            Alergias
          </h3>
          {alergias.length === 0 ? (
            <p className="mt-2 text-sm text-gris-600">Sin alergias conocidas.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {alergias.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-rojo-200 bg-white px-3 py-1 text-sm font-medium text-rojo-800"
                >
                  {a}
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gris-800">Antecedentes</h3>
          {antecedentes.length === 0 ? (
            <p className="mt-2 text-sm text-gris-600">Sin antecedentes registrados.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {antecedentes.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-gris-200 bg-gris-50 px-3 py-1 text-sm text-gris-700"
                >
                  {a}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-gris-600">
            {años} años · {paciente.obraSocial} {paciente.afiliado}
          </p>
        </Tarjeta>
      </div>

      <Tarjeta className="p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-gris-800">
          Consultas <span className="font-normal text-gris-500">({consultas.length})</span>
        </h3>

        <ul className="space-y-2">
          {consultas.map((c) => {
            const abiertaEsta = enPapel || abierta === c.id;
            const conAlerta = c.signos.some(enAlerta);

            return (
              <li key={c.id} className="rounded-[9px] border border-gris-200">
                <button
                  type="button"
                  onClick={() => setAbierta(abiertaEsta ? null : c.id)}
                  aria-expanded={abiertaEsta}
                  className="flex w-full items-baseline gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gris-50"
                >
                  <span className="tabular w-20 shrink-0 text-sm text-gris-600">
                    {fechaCorta(c.fecha)}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-gris-900">
                    {c.motivo}
                  </span>
                  {conAlerta && (
                    <span className="shrink-0 rounded-full border border-rojo-100 bg-rojo-50 px-2 py-0.5 text-[11px] font-medium text-rojo-800">
                      Signos fuera de rango
                    </span>
                  )}
                  <span className="no-imprimir shrink-0 text-xs text-marca-700 underline">
                    {abiertaEsta ? 'Cerrar' : 'Ver'}
                  </span>
                </button>

                {abiertaEsta && (
                  <div className="space-y-4 border-t border-gris-200 px-3 py-4">
                    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {c.signos.map((s) => (
                        <SignoVital key={s.clave} signo={s} />
                      ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <section>
                        <h4 className="text-[11px] font-semibold tracking-[.08em] text-gris-500 uppercase">
                          Examen físico
                        </h4>
                        <p className="mt-1 text-sm text-gris-700">{c.examen}</p>
                      </section>
                      <section>
                        <h4 className="text-[11px] font-semibold tracking-[.08em] text-gris-500 uppercase">
                          Indicaciones
                        </h4>
                        <ul className="mt-1 space-y-1 text-sm text-gris-700">
                          {c.indicaciones.map((ind) => (
                            <li key={ind} className="flex items-start gap-2">
                              <span
                                aria-hidden="true"
                                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-marca-400"
                              />
                              {ind}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>

                    <section>
                      <h4 className="text-[11px] font-semibold tracking-[.08em] text-gris-500 uppercase">
                        Diagnóstico
                      </h4>
                      <p className="mt-1 flex items-baseline gap-2 text-sm">
                        <span className="tabular rounded border border-marca-100 bg-marca-50 px-1.5 py-0.5 text-xs font-semibold text-marca-800">
                          {c.diagnostico.codigo}
                        </span>
                        <span className="text-gris-800">{c.diagnostico.texto}</span>
                      </p>
                    </section>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Tarjeta>

      {/* Es una herramienta de pantalla: en la ficha impresa no pinta nada. */}
      <Tarjeta className="no-imprimir p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-gris-800">Catálogo de diagnósticos</h3>
        <p className="mt-1 mb-3 text-sm text-gris-600">
          El diagnóstico se elige, no se escribe. Con texto libre conviven «HTA», «hipertensión» y
          «Hipertensión arterial», y con eso no se cuenta nada.
        </p>
        <BuscadorDiagnostico />
      </Tarjeta>
    </div>
  );
}
