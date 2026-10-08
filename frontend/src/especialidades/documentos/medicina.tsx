/**
 * Los documentos de medicina general: receta, orden de estudio y certificado.
 *
 * Son los tres papeles que un clínico firma todo el día, y la razón por la que muchos
 * consultorios todavía tienen un talonario preimpreso. Que salgan del sistema con el membrete,
 * el paciente y la matrícula ya puestos es la mitad del argumento.
 *
 * **La receta no es una receta electrónica**, y el papel lo dice. Una receta digital válida
 * necesita firma electrónica y trazabilidad, que es de la etapa con servidor; lo que sale de acá
 * es el formulario impreso, que se firma a mano como se viene firmando.
 */

import { edad, fechaCorta, HOY, type Paciente } from '../../datos/consultorio.ts';
import {
  Bloque,
  DatosDelPaciente,
  Firmas,
  Membrete,
  Renglones,
  numeroDeDocumento,
} from '../../documentos/Hoja.tsx';

/** El profesional que firma. En la etapa dos sale de la sesión; acá es el de la demo. */
const FIRMANTE = { nombre: 'Dra. Carolina Ferreyra', matricula: 'MP 8412' } as const;

export function Receta({ paciente }: { paciente: Paciente }) {
  return (
    <>
      <Membrete titulo="Receta" />
      <DatosDelPaciente paciente={paciente} />

      <p className="mb-1 text-sm text-gris-700">Edad: {edad(paciente)} años</p>

      <div className="mt-4 mb-6 min-h-[230px] border border-gris-300 p-4">
        <p className="mb-3 font-serif text-2xl leading-none text-gris-900">℞</p>
        <Renglones cantidad={6} />
      </div>

      <Bloque titulo="Indicaciones">
        <Renglones cantidad={2} />
      </Bloque>

      <p className="tabular text-xs text-gris-600">
        Receta N° {numeroDeDocumento(paciente, 'receta')} ·{' '}
        <strong>formulario impreso, no receta electrónica</strong>: la firma digital y la
        trazabilidad llegan con el servidor.
      </p>

      <Firmas izquierda={`${FIRMANTE.nombre} — ${FIRMANTE.matricula}`} />
    </>
  );
}

const ESTUDIOS = [
  'Laboratorio: hemograma completo, glucemia, urea, creatinina',
  'Perfil lipídico: colesterol total, HDL, LDL, triglicéridos',
  'Hepatograma',
  'Orina completa y urocultivo',
  'Electrocardiograma',
  'Radiografía de tórax, frente y perfil',
  'Ecografía abdominal',
  'Perfil tiroideo: TSH, T4 libre',
];

export function OrdenDeEstudio({ paciente }: { paciente: Paciente }) {
  const semilla = Number(paciente.id.replace(/\D/g, '')) || 1;
  const pedidos = new Set([semilla % ESTUDIOS.length, (semilla * 5 + 3) % ESTUDIOS.length]);

  return (
    <>
      <Membrete titulo="Orden de estudio" />
      <DatosDelPaciente paciente={paciente} />

      <Bloque titulo="Se solicita">
        <ul className="space-y-1.5">
          {ESTUDIOS.map((estudio, i) => (
            <li key={estudio} className="flex items-baseline gap-2.5">
              {/*
                La casilla se marca a mano: no hay formularios que guarden en esta etapa.

                **La cruz es un trazo, no un fondo.** La versión anterior marcaba pintando la
                casilla de negro, y los navegadores no imprimen fondos con la configuración de
                fábrica: la orden salía con las ocho casillas vacías y nadie se enteraba hasta
                tenerla en la mano.
              */}
              <span
                aria-hidden="true"
                className="inline-grid size-3 shrink-0 place-items-center border border-gris-700"
              >
                {pedidos.has(i) && (
                  <svg viewBox="0 0 10 10" className="size-full">
                    <path
                      d="M1.5 1.5 8.5 8.5 M8.5 1.5 1.5 8.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
              <span className={pedidos.has(i) ? 'font-medium text-gris-900' : 'text-gris-700'}>
                {estudio}
              </span>
            </li>
          ))}
          <li className="flex items-baseline gap-2.5">
            <span
              aria-hidden="true"
              className="inline-block size-3 shrink-0 border border-gris-500"
            />
            <span className="flex-1 border-b border-dotted border-gris-400 text-gris-700">
              Otro:
            </span>
          </li>
        </ul>
      </Bloque>

      <Bloque titulo="Diagnóstico presuntivo">
        <Renglones cantidad={2} />
      </Bloque>

      <p className="text-sm text-gris-700">
        Cobertura: {paciente.obraSocial} · afiliado {paciente.afiliado}
      </p>

      <p className="tabular mt-4 text-xs text-gris-600">
        Orden N° {numeroDeDocumento(paciente, 'orden')}
      </p>

      <Firmas izquierda={`${FIRMANTE.nombre} — ${FIRMANTE.matricula}`} />
    </>
  );
}

export function CertificadoMedico({ paciente }: { paciente: Paciente }) {
  const semilla = Number(paciente.id.replace(/\D/g, '')) || 1;
  const dias = 1 + (semilla % 5);
  const hasta = new Date(HOY);
  hasta.setDate(hasta.getDate() + dias - 1);

  return (
    <>
      <Membrete titulo="Certificado médico" />
      <DatosDelPaciente paciente={paciente} />

      <p className="text-sm leading-relaxed text-gris-800">
        Certifico haber asistido en el día de la fecha a{' '}
        <strong>
          {paciente.apellido}, {paciente.nombre}
        </strong>
        , DNI {paciente.documento}, de {edad(paciente)} años de edad, quien presenta un cuadro que
        requiere{' '}
        <strong>
          reposo por {dias} {dias === 1 ? 'día' : 'días'}
        </strong>
        , desde el {fechaCorta(HOY)} hasta el {fechaCorta(hasta)} inclusive.
      </p>

      <Bloque titulo="Observaciones">
        <Renglones cantidad={3} />
      </Bloque>

      <p className="text-sm text-gris-800">
        Se extiende el presente a pedido del interesado, a los fines que estime corresponder.
      </p>

      <p className="tabular mt-5 text-xs text-gris-600">
        Certificado N° {numeroDeDocumento(paciente, 'certificado')}
      </p>

      <Firmas izquierda={`${FIRMANTE.nombre} — ${FIRMANTE.matricula}`} />
    </>
  );
}
