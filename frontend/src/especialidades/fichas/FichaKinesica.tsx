/**
 * La ficha kinésica: plan de tratamiento y evolución por sesión.
 *
 * **Es la vertical que más se diferencia de las otras dos, y por eso es la que prueba el
 * diseño.** Un kinesiólogo no atiende consultas sueltas: atiende **series de sesiones
 * autorizadas**, y lo que lleva es la evolución entre una y la siguiente. Si el núcleo aguanta
 * esto sin bifurcarse, aguanta el resto (`D13`).
 *
 * Tres cosas que no son adorno:
 *
 * 1. **Las sesiones autorizadas se cuentan y se avisan antes de que se acaben.** Es el dolor
 *    administrativo real del oficio: la autorización se pide con anticipación y cuando se agota
 *    en medio de un tratamiento el paciente deja de venir. Avisar en la última sesión no sirve
 *    de nada; hay que avisar cuando todavía se puede tramitar.
 *
 * 2. **El dolor se registra al inicio y al final de cada sesión.** Es lo que convierte la ficha
 *    en evidencia: el alta kinesiológica se justifica mostrando la curva, no escribiendo
 *    «evolución favorable».
 *
 * 3. **La evolución se lee como serie, no como lista de eventos.** Cuatro sesiones sueltas no
 *    dicen nada; la misma información dibujada de la primera a la última dice si el tratamiento
 *    está funcionando, que es la única pregunta que importa.
 */

import {
  fechaCorta,
  mezclar,
  profesionalDe,
  type Paciente,
  type ProfesionalId,
} from '../../datos/consultorio.ts';
import { Tarjeta } from '../../components/ui.tsx';

// --- El modelo ---------------------------------------------------------------

/**
 * El diagnóstico y la región van **juntos**, no se sortean por separado.
 *
 * La versión anterior elegía uno de seis diagnósticos y una de ocho regiones con dos cuentas
 * independientes, así que en 32 de los 40 pacientes decían cosas incompatibles: «Gonartrosis» en
 * el hombro, «Síndrome de manguito rotador» en la rodilla. Y no se quedaba en la pantalla: el
 * texto se copia tal cual al plan de sesiones, al informe de evolución y al alta — los tres
 * papeles que se le presentan a la obra social.
 *
 * Un kinesiólogo lo ve en el primer renglón.
 */
const CUADROS = [
  { diagnostico: 'Lumbalgia mecánica', region: 'Columna lumbar' },
  { diagnostico: 'Síndrome de manguito rotador', region: 'Hombro derecho' },
  { diagnostico: 'Síndrome de manguito rotador', region: 'Hombro izquierdo' },
  { diagnostico: 'Gonartrosis', region: 'Rodilla derecha' },
  { diagnostico: 'Post operatorio de LCA', region: 'Rodilla izquierda' },
  { diagnostico: 'Cervicalgia postural', region: 'Columna cervical' },
  { diagnostico: 'Esguince de tobillo grado II', region: 'Tobillo derecho' },
  { diagnostico: 'Trocanteritis', region: 'Cadera izquierda' },
] as const;

/** Las técnicas, que sí valen para cualquier cuadro. */
const TECNICAS = [
  'Terapia manual',
  'Ejercicio terapéutico',
  'Ultrasonido',
  'Magnetoterapia',
  'Electroanalgesia',
  'Drenaje linfático',
  'Reeducación postural',
  'Movilización articular',
] as const;

interface Sesion {
  numero: number;
  fecha: Date;
  profesionalId: ProfesionalId;
  region: string;
  tecnicas: string[];
  /** Escala visual analógica, de 0 a 10. */
  dolorInicio: number;
  dolorFin: number;
  observacion: string;
}

export interface Plan {
  diagnostico: string;
  region: string;
  autorizadas: number;
  autorizacion: string;
  inicio: Date;
  sesiones: Sesion[];
}

/** Con esta cantidad o menos de sesiones restantes ya hay que estar tramitando la renovación. */
const UMBRAL_AVISO = 3;

const OBSERVACIONES = [
  'Buena tolerancia. Se progresa carga.',
  'Refiere molestia al inicio, cede durante la sesión.',
  'Mejora del rango articular respecto de la sesión anterior.',
  'Se agrega trabajo domiciliario.',
  'Sin dolor en reposo. Persiste al esfuerzo máximo.',
  'Completa la serie de ejercicios sin compensaciones.',
] as const;

// --- Los datos de la demo ----------------------------------------------------

/**
 * El plan de este paciente.
 *
 * Exportado porque **los documentos impresos lo necesitan igual**: el plan de sesiones, el
 * informe de evolución y el alta dicen las mismas cifras que la pantalla. Derivarlo dos veces
 * es garantizar que algún día digan cosas distintas, y la primera vez que alguien compare el
 * papel con la ficha se nota.
 */
export function planDe(paciente: Paciente): Plan {
  const semilla = Number(paciente.id.replace(/\D/g, '')) || 1;
  const autorizadas = [8, 10, 12, 15][semilla % 4]!;
  // Algunos planes quedan cerca del límite a propósito: sin eso, el aviso de renovación no se
  // ve nunca y es justamente lo que hay que demostrar.
  const hechas = Math.min(autorizadas, 3 + (semilla % (autorizadas - 1)));
  const cuadro = CUADROS[mezclar(semilla * 211 + 13) % CUADROS.length]!;
  const region = cuadro.region;
  const inicio = new Date(paciente.ultimaVisita);
  inicio.setDate(inicio.getDate() - hechas * 3);

  const dolorInicial = 7 + (semilla % 3);

  const sesiones: Sesion[] = Array.from({ length: hechas }, (_, i) => {
    const n = semilla * 13 + i * 29;
    const fecha = new Date(inicio);
    fecha.setDate(fecha.getDate() + i * 3);

    // El dolor baja a lo largo de la serie, con algún repunte: una curva perfectamente
    // descendente no la tiene ningún paciente y se lee como inventada.
    const avance = (i / Math.max(1, hechas - 1)) * (dolorInicial - 2);
    const repunte = i > 0 && n % 7 === 0 ? 1 : 0;
    const dolorInicio = Math.max(1, Math.round(dolorInicial - avance + repunte));
    const dolorFin = Math.max(0, dolorInicio - 1 - (n % 2));

    return {
      numero: i + 1,
      fecha,
      profesionalId: (['p1', 'p2', 'p3'] as const)[n % 3]!,
      region,
      tecnicas: [TECNICAS[n % TECNICAS.length]!, TECNICAS[(n + 3) % TECNICAS.length]!],
      dolorInicio,
      dolorFin,
      observacion: OBSERVACIONES[n % OBSERVACIONES.length]!,
    };
  });

  return {
    diagnostico: cuadro.diagnostico,
    region,
    autorizadas,
    autorizacion: `AUT-${String(400_000 + semilla * 137)}`,
    inicio,
    sesiones,
  };
}

// --- El dibujo ---------------------------------------------------------------

/** La barra de sesiones: usadas, restantes, y cuántas quedan sin contar a ojo. */
function Progreso({ hechas, autorizadas }: { hechas: number; autorizadas: number }) {
  return (
    <div
      className="flex gap-1"
      role="img"
      aria-label={`${hechas} de ${autorizadas} sesiones autorizadas`}
    >
      {Array.from({ length: autorizadas }, (_, i) => (
        <span
          key={i}
          className={`h-2 flex-1 rounded-full ${i < hechas ? 'bg-marca-500' : 'bg-gris-300'}`}
        />
      ))}
    </div>
  );
}

/**
 * La curva del dolor a lo largo de la serie.
 *
 * Se dibuja además la tabla debajo: un gráfico sin sus números no se puede leer en voz alta ni
 * verificar, y esto termina impreso en una historia clínica.
 */
function Curva({ sesiones }: { sesiones: Sesion[] }) {
  if (sesiones.length < 2) return null;

  const ancho = 100;
  const alto = 40;
  /** Se deja margen a la izquierda para los números de la escala. */
  const x = (i: number) => 8 + (i / (sesiones.length - 1)) * (ancho - 8);
  const y = (dolor: number) => alto - (dolor / 10) * alto;

  const linea = (campo: 'dolorInicio' | 'dolorFin') =>
    sesiones
      .map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(s[campo]).toFixed(1)}`)
      .join(' ');

  return (
    <svg
      viewBox={`-1 -4 ${ancho + 4} ${alto + 12}`}
      className="w-full"
      role="img"
      aria-label={`Dolor de la sesión 1 a la ${sesiones.length}: al inicio baja de ${sesiones[0]!.dolorInicio} a ${sesiones.at(-1)!.dolorInicio} sobre 10`}
    >
      {/* La escala rotulada: un gráfico sin números se mira, no se lee. */}
      {[0, 5, 10].map((d) => (
        <g key={d}>
          <line
            x1="6"
            y1={y(d)}
            x2={ancho}
            y2={y(d)}
            className="stroke-gris-200"
            strokeWidth="0.5"
          />
          <text
            x="0"
            y={y(d) + 1.6}
            className="fill-gris-500"
            style={{ fontSize: '4px' }}
            aria-hidden="true"
          >
            {d}
          </text>
        </g>
      ))}
      <path d={linea('dolorInicio')} className="fill-none stroke-rojo-600" strokeWidth="1.6" />
      {/* La de después de la sesión va punteada: se distinguen sin depender del color. */}
      <path
        d={linea('dolorFin')}
        className="fill-none stroke-tinta-600"
        strokeWidth="1.6"
        strokeDasharray="3 2"
      />
      {sesiones.map((s, i) => (
        <g key={s.numero}>
          <circle cx={x(i)} cy={y(s.dolorInicio)} r="1.6" className="fill-rojo-600" />
          <text
            x={x(i)}
            y={alto + 5}
            textAnchor="middle"
            className="fill-gris-500"
            style={{ fontSize: '3.6px' }}
            aria-hidden="true"
          >
            {s.numero}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function FichaKinesica({ paciente }: { paciente: Paciente }) {
  const plan = planDe(paciente);
  const hechas = plan.sesiones.length;
  const restantes = plan.autorizadas - hechas;
  const agotadas = restantes === 0;
  const porAgotarse = restantes > 0 && restantes <= UMBRAL_AVISO;

  const primera = plan.sesiones[0];
  const ultima = plan.sesiones.at(-1);
  const mejora = primera && ultima ? primera.dolorInicio - ultima.dolorInicio : 0;

  return (
    <div className="space-y-4">
      <Tarjeta
        className={`p-4 sm:p-5 ${agotadas ? 'border-rojo-600' : porAgotarse ? 'border-ambar-600' : ''}`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gris-800">Plan de tratamiento</h3>
            <p className="mt-0.5 text-sm text-gris-700">
              {plan.diagnostico} · {plan.region}
            </p>
          </div>
          <p className="tabular text-xs text-gris-600">
            Autorización {plan.autorizacion} · desde {fechaCorta(plan.inicio)}
          </p>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <p className="text-sm text-gris-700">
              <span className="tabular text-lg font-semibold text-gris-900">{hechas}</span>
              <span className="text-gris-600"> de {plan.autorizadas} sesiones autorizadas</span>
            </p>
            {(agotadas || porAgotarse) && (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  agotadas
                    ? 'border-rojo-100 bg-rojo-50 text-rojo-800'
                    : 'border-ambar-100 bg-ambar-50 text-ambar-800'
                }`}
              >
                {agotadas ? 'Autorización agotada' : `Quedan ${restantes} — pedir renovación`}
              </span>
            )}
          </div>
          <Progreso hechas={hechas} autorizadas={plan.autorizadas} />
          {(agotadas || porAgotarse) && (
            <p className="mt-2 text-xs text-gris-600">
              {agotadas
                ? 'No se pueden agendar más sesiones de este plan hasta que la obra social autorice una serie nueva.'
                : 'La renovación se tramita antes de la última sesión: si se agota en el medio, el paciente deja de venir.'}
            </p>
          )}
        </div>
      </Tarjeta>

      {plan.sesiones.length >= 2 && (
        <Tarjeta className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-gris-800">Evolución del dolor</h3>
            <p className="text-xs text-gris-600">
              Escala de 0 a 10 · <span className="text-rojo-700">— al inicio de la sesión</span> ·{' '}
              <span className="text-tinta-700">- - al final</span>
            </p>
          </div>

          <Curva sesiones={plan.sesiones} />

          <p className="mt-3 text-sm text-gris-700">
            {mejora > 0 ? (
              <>
                De <span className="font-semibold text-gris-900">{primera!.dolorInicio}/10</span> en
                la primera sesión a{' '}
                <span className="font-semibold text-gris-900">{ultima!.dolorInicio}/10</span> en la
                última: <span className="font-semibold text-marca-700">{mejora} puntos menos</span>{' '}
                en {hechas} sesiones.
              </>
            ) : (
              <>
                Sin mejora medible entre la primera y la última sesión. Conviene revisar el plan
                antes de seguir consumiendo autorizaciones.
              </>
            )}
          </p>
        </Tarjeta>
      )}

      <Tarjeta className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <caption className="px-4 pt-4 pb-2 text-left text-sm font-semibold text-gris-800">
            Registro por sesión
          </caption>
          <thead className="border-y border-gris-200 bg-gris-50 text-left text-xs font-semibold text-gris-600">
            <tr>
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Fecha</th>
              <th className="px-3 py-2.5">Región</th>
              <th className="px-3 py-2.5">Técnicas</th>
              <th className="px-3 py-2.5">Dolor</th>
              <th className="px-3 py-2.5">Observación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-100">
            {plan.sesiones.map((s) => (
              <tr key={s.numero}>
                <td className="tabular px-3 py-2.5 font-medium text-gris-900">{s.numero}</td>
                <td className="tabular px-3 py-2.5 text-gris-600">{fechaCorta(s.fecha)}</td>
                <td className="px-3 py-2.5 text-gris-700">{s.region}</td>
                <td className="px-3 py-2.5 text-gris-700">{s.tecnicas.join(' · ')}</td>
                <td className="tabular px-3 py-2.5">
                  <span className="text-rojo-700">{s.dolorInicio}</span>
                  <span className="text-gris-400"> → </span>
                  <span className="text-tinta-700">{s.dolorFin}</span>
                  <span className="ml-1 text-xs text-gris-500">/10</span>
                </td>
                <td className="px-3 py-2.5 text-gris-600">
                  {s.observacion}
                  <span className="block text-xs text-gris-500">
                    {profesionalDe(s.profesionalId).nombre}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>
    </div>
  );
}
