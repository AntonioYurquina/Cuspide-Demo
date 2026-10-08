/**
 * Los documentos de kinesiología: plan de sesiones, informe de evolución y alta.
 *
 * **Los tres existen para la obra social, no para el paciente.** El plan es lo que se presenta
 * para pedir la autorización; el informe de evolución es lo que se presenta para pedir la
 * renovación cuando las sesiones se agotan; y el alta es lo que cierra el tratamiento. Un
 * kinesiólogo que no los emite cobra tarde o no cobra, así que salir bien de acá vale más que
 * cualquier pantalla.
 *
 * Por eso los tres llevan el número de autorización arriba y la cuenta de sesiones a la vista.
 */

import { fechaCorta, HOY, type Paciente } from '../../datos/consultorio.ts';
import { planDe } from '../fichas/FichaKinesica.tsx';
import {
  Bloque,
  DatosDelPaciente,
  Firmas,
  Membrete,
  Renglones,
  numeroDeDocumento,
} from '../../documentos/Hoja.tsx';

const FIRMANTE = { nombre: 'Lic. Lucía Sandoval', matricula: 'MP 7725' } as const;

/**
 * Lo que dice el papel sale del **mismo** plan que muestra la pantalla.
 *
 * `planDe` vive en la ficha y se importa acá a propósito: si cada uno derivara lo suyo, el día
 * que cambie una regla el papel y la pantalla empiezan a decir cifras distintas, y eso se nota
 * la primera vez que alguien los compara — que en kinesiología es siempre, porque el informe se
 * presenta a la obra social junto con la ficha.
 */
function datosDelPlan(paciente: Paciente) {
  const plan = planDe(paciente);
  const hechas = plan.sesiones.length;
  const primera = plan.sesiones[0];
  const ultima = plan.sesiones.at(-1);
  return {
    ...plan,
    hechas,
    restantes: plan.autorizadas - hechas,
    dolorInicial: primera?.dolorInicio ?? 0,
    dolorActual: ultima?.dolorInicio ?? 0,
  };
}

function Encabezado({ paciente }: { paciente: Paciente }) {
  const p = datosDelPlan(paciente);
  return (
    <div className="mb-5 grid grid-cols-3 gap-x-6 border-y border-gris-300 py-2 text-sm">
      {(
        [
          // Un paciente particular no tiene autorización de obra social que exhibir.
          [
            'Autorización',
            paciente.obraSocial === 'Particular' ? '— (particular)' : p.autorizacion,
          ],
          ['Obra social', paciente.obraSocial],
          ['Sesiones', `${p.hechas} de ${p.autorizadas}`],
        ] as const
      ).map(([rotulo, valor]) => (
        <div key={rotulo}>
          <p className="text-[11px] font-bold tracking-[.08em] text-gris-600 uppercase">{rotulo}</p>
          <p className="tabular font-medium text-gris-900">{valor}</p>
        </div>
      ))}
    </div>
  );
}

const OBJETIVOS = [
  'Disminuir el dolor y la inflamación.',
  'Recuperar el rango articular completo.',
  'Recuperar fuerza y resistencia de la musculatura comprometida.',
  'Reintegrar al paciente a sus actividades habituales sin compensaciones.',
];

const TECNICAS = [
  'Terapia manual y movilización articular',
  'Ejercicio terapéutico progresivo',
  'Agentes físicos: ultrasonido, magnetoterapia, electroanalgesia',
  'Pautas de trabajo domiciliario',
];

export function PlanDeSesiones({ paciente }: { paciente: Paciente }) {
  const p = datosDelPlan(paciente);

  return (
    <>
      <Membrete titulo="Plan de sesiones" />
      <DatosDelPaciente paciente={paciente} />
      <Encabezado paciente={paciente} />

      <Bloque titulo="Diagnóstico kinésico">
        <p>
          <strong>{p.diagnostico}</strong> · {p.region}
        </p>
        <p className="mt-1 text-gris-700">
          Inicio del tratamiento: {fechaCorta(p.inicio)} · dolor inicial {p.dolorInicial}/10 en
          escala visual analógica.
        </p>
      </Bloque>

      <Bloque titulo="Objetivos">
        <ol className="list-inside list-decimal space-y-0.5">
          {OBJETIVOS.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ol>
      </Bloque>

      <Bloque titulo="Técnicas previstas">
        <ul className="space-y-0.5">
          {TECNICAS.map((t) => (
            <li key={t} className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="Sesiones solicitadas">
        <p>
          Se solicitan <strong>{p.autorizadas} sesiones</strong>, con frecuencia de tres semanales,
          sujetas a evaluación al finalizar la serie.
        </p>
      </Bloque>

      <p className="tabular text-xs text-gris-600">
        Plan N° {numeroDeDocumento(paciente, 'plansesiones')}
      </p>

      <Firmas izquierda={`${FIRMANTE.nombre} — ${FIRMANTE.matricula}`} />
    </>
  );
}

export function InformeDeEvolucion({ paciente }: { paciente: Paciente }) {
  const p = datosDelPlan(paciente);
  const mejora = p.dolorInicial - p.dolorActual;

  return (
    <>
      <Membrete titulo="Informe de evolución" />
      <DatosDelPaciente paciente={paciente} />
      <Encabezado paciente={paciente} />

      <Bloque titulo="Evolución">
        <p className="leading-relaxed">
          El paciente inició tratamiento el {fechaCorta(p.inicio)} por{' '}
          <strong>{p.diagnostico}</strong> en {p.region.toLowerCase()}, con dolor de{' '}
          <strong>{p.dolorInicial}/10</strong>. Lleva <strong>{p.hechas}</strong> de las{' '}
          {p.autorizadas} sesiones autorizadas y refiere actualmente{' '}
          <strong>{p.dolorActual}/10</strong>
          {mejora > 0 ? (
            <>
              , lo que representa una mejora de <strong>{mejora} puntos</strong> en la escala visual
              analógica.
            </>
          ) : (
            <>, sin variación significativa respecto del inicio.</>
          )}
        </p>
      </Bloque>

      <Bloque titulo="Estado funcional actual">
        <Renglones cantidad={3} />
      </Bloque>

      <Bloque titulo="Conducta propuesta">
        <p>
          {p.restantes <= 3 ? (
            <>
              Se solicita <strong>renovación de la autorización</strong> por una serie adicional, a
              fin de completar los objetivos planteados. Quedan {p.restantes} sesiones de la serie
              en curso.
            </>
          ) : (
            <>
              Se continúa con el plan autorizado. Restan {p.restantes} sesiones de la serie en
              curso.
            </>
          )}
        </p>
      </Bloque>

      <p className="tabular text-xs text-gris-600">
        Informe N° {numeroDeDocumento(paciente, 'informe')}
      </p>

      <Firmas izquierda={`${FIRMANTE.nombre} — ${FIRMANTE.matricula}`} />
    </>
  );
}

export function AltaKinesiologica({ paciente }: { paciente: Paciente }) {
  const p = datosDelPlan(paciente);

  return (
    <>
      <Membrete titulo="Alta kinesiológica" />
      <DatosDelPaciente paciente={paciente} />
      <Encabezado paciente={paciente} />

      <Bloque titulo="Tratamiento realizado">
        <p className="leading-relaxed">
          {/*
            El alta puede darse antes de agotar la serie si los objetivos se cumplieron, pero el
            papel tiene que decir cuál de los dos casos es: antes decía siempre lo mismo, y salía
            un «alta» en la sesión 4 de 10 sin ninguna explicación.
          */}
          Se otorga el alta kinesiológica a{' '}
          <strong>
            {paciente.apellido}, {paciente.nombre}
          </strong>
          , quien realizó <strong>{p.hechas} sesiones</strong> entre el {fechaCorta(p.inicio)} y el{' '}
          {fechaCorta(HOY)} por <strong>{p.diagnostico}</strong> en {p.region.toLowerCase()}.
        </p>
        <p className="mt-2 leading-relaxed">
          El dolor descendió de {p.dolorInicial}/10 a {p.dolorActual}/10 en escala visual analógica,
          con recuperación del rango articular y de la fuerza necesarias para las actividades
          habituales.
        </p>
      </Bloque>

      <Bloque titulo="Indicaciones al alta">
        <ul className="space-y-0.5">
          <li>Continuar el plan de ejercicios domiciliarios indicado.</li>
          <li>Evitar cargas máximas durante las primeras cuatro semanas.</li>
          <li>Consultar ante reaparición del dolor.</li>
        </ul>
        <Renglones cantidad={2} />
      </Bloque>

      <p className="tabular text-xs text-gris-600">Alta N° {numeroDeDocumento(paciente, 'alta')}</p>

      <Firmas izquierda={`${FIRMANTE.nombre} — ${FIRMANTE.matricula}`} derecha="Paciente" />
    </>
  );
}
