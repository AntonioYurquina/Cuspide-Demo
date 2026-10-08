/**
 * Los documentos de odontología: consentimiento informado y plan de tratamiento.
 *
 * El consentimiento no es un trámite: es el papel que el odontólogo necesita firmado **antes**
 * de una extracción o una endodoncia, y la razón por la que muchos consultorios todavía usan una
 * carpeta de Word. Que salga del sistema con el nombre del paciente, la práctica y los riesgos ya
 * escritos es de las cosas que se agradecen todos los días.
 */

import { pesos, type Paciente } from '../../datos/consultorio.ts';
import {
  Bloque,
  DatosDelPaciente,
  Firmas,
  Membrete,
  Renglones,
  numeroDeDocumento,
} from '../../documentos/Hoja.tsx';

const RIESGOS = [
  'Dolor e inflamación en los días posteriores, que ceden con la medicación indicada.',
  'Sangrado leve durante las primeras horas.',
  'Posibilidad de infección, que se previene siguiendo las indicaciones de higiene y medicación.',
  'En extracciones, riesgo de alveolitis y, en piezas inferiores, de compromiso transitorio de la sensibilidad del labio.',
  'En endodoncias, posibilidad de necesitar más de una sesión y de fractura de la pieza tratada.',
];

export function ConsentimientoInformado({ paciente }: { paciente: Paciente }) {
  return (
    <>
      <Membrete titulo="Consentimiento informado" />
      <DatosDelPaciente paciente={paciente} />

      <Bloque titulo="Tratamiento propuesto">
        <Renglones cantidad={2} />
      </Bloque>

      <Bloque titulo="Declaración">
        <p className="leading-relaxed">
          Declaro que se me ha explicado, en un lenguaje que comprendo, en qué consiste el
          tratamiento propuesto, sus alternativas, los resultados esperados y los riesgos que
          implica. He tenido oportunidad de hacer preguntas y todas fueron respondidas.
        </p>
      </Bloque>

      <Bloque titulo="Riesgos informados">
        <ul className="space-y-1">
          {RIESGOS.map((r) => (
            <li key={r} className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="Antecedentes declarados por el paciente">
        <p className="text-gris-700">
          Alergias, medicación habitual, embarazo, anticoagulantes, marcapasos u otras condiciones
          relevantes:
        </p>
        <Renglones cantidad={2} />
      </Bloque>

      <p className="text-sm leading-relaxed text-gris-800">
        Presto mi conformidad para la realización del tratamiento descripto. Entiendo que puedo
        revocar este consentimiento en cualquier momento antes de su ejecución.
      </p>

      <p className="tabular mt-5 text-xs text-gris-600">
        Consentimiento N° {numeroDeDocumento(paciente, 'consentimiento')}
      </p>

      <Firmas
        izquierda="Profesional actuante"
        derecha="Paciente o responsable · Aclaración y DNI"
      />
    </>
  );
}

const ETAPAS = [
  { etapa: 'Diagnóstico y plan', detalle: 'Consulta, radiografías y fichado.', sesiones: 1 },
  { etapa: 'Higiene', detalle: 'Tartrectomía y fluoración.', sesiones: 1 },
  { etapa: 'Operatoria', detalle: 'Restauraciones de las piezas comprometidas.', sesiones: 3 },
  { etapa: 'Rehabilitación', detalle: 'Toma de impresión, prueba y cementado.', sesiones: 3 },
  { etapa: 'Control', detalle: 'Control a los 30 y a los 180 días.', sesiones: 2 },
];

export function PlanDeTratamiento({ paciente }: { paciente: Paciente }) {
  const semilla = Number(paciente.id.replace(/\D/g, '')) || 1;
  const etapas = ETAPAS.slice(0, 3 + (semilla % 3));
  const precio = (i: number) =>
    (12_000 + ((semilla * 7 + i * 13) % 9) * 6_500) * etapas[i]!.sesiones;
  const total = etapas.reduce((s, _, i) => s + precio(i), 0);
  const sesiones = etapas.reduce((s, e) => s + e.sesiones, 0);

  return (
    <>
      <Membrete titulo="Plan de tratamiento" />
      <DatosDelPaciente paciente={paciente} />

      <table className="mb-4 w-full text-sm">
        <thead className="border-y border-gris-800 text-left text-xs font-bold text-gris-800">
          <tr>
            <th className="py-1.5">Etapa</th>
            <th className="py-1.5">Qué incluye</th>
            <th className="w-20 py-1.5 text-right">Sesiones</th>
            <th className="w-28 py-1.5 text-right">Importe</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gris-200">
          {etapas.map((e, i) => (
            <tr key={e.etapa}>
              <td className="py-1.5 font-medium text-gris-900">{e.etapa}</td>
              <td className="py-1.5 text-gris-700">{e.detalle}</td>
              <td className="tabular py-1.5 text-right text-gris-800">{e.sesiones}</td>
              <td className="tabular py-1.5 text-right text-gris-900">{pesos(precio(i))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-gris-800">
          <tr>
            <td colSpan={2} className="py-2 text-sm font-bold text-gris-900">
              Total
            </td>
            <td className="tabular py-2 text-right text-sm font-bold text-gris-900">{sesiones}</td>
            <td className="tabular py-2 text-right text-base font-bold text-gris-900">
              {pesos(total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <Bloque titulo="Cómo se trabaja">
        <ul className="space-y-0.5">
          <li>El plan puede ajustarse según la evolución: todo cambio se informa antes.</li>
          <li>Las urgencias se atienden fuera del plan y se presupuestan aparte.</li>
          <li>
            Cobertura de {paciente.obraSocial} sujeta a autorización. Los importes son particulares.
          </li>
        </ul>
      </Bloque>

      <p className="tabular text-xs text-gris-600">Plan N° {numeroDeDocumento(paciente, 'plan')}</p>

      <Firmas izquierda="Profesional actuante" derecha="Conformidad del paciente" />
    </>
  );
}
