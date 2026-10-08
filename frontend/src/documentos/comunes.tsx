/**
 * Los documentos que sirven a cualquier especialidad.
 *
 * Están en el núcleo justamente porque **no cambian entre un odontólogo y un kinesiólogo**: una
 * constancia de atención, un presupuesto y un comprobante son el mismo papel con otra práctica
 * adentro. Lo que sí cambia —el consentimiento, la receta, el plan— vive en su vertical.
 *
 * Ninguno escribe la palabra de una especialidad: toman el vocabulario de `useEspecialidad()`,
 * y `vocabulario.test.ts` lo vigila.
 */

import {
  HOY,
  fechaCorta,
  fechaDeDocumento,
  hora,
  pesos,
  profesionalDe,
  atencionesDe,
  mezclar,
  precioDe,
  type Paciente,
} from '../datos/consultorio.ts';
import { may, useEspecialidad } from '../especialidades/index.ts';
import { Bloque, DatosDelPaciente, Firmas, Membrete, numeroDeDocumento } from './Hoja.tsx';
import type { Documento } from './Visor.tsx';

/** El último turno atendido de este paciente, que es lo que respalda casi todo documento. */
function ultimaAtencion(paciente: Paciente) {
  return atencionesDe(paciente.id)[0];
}

export function ConstanciaDeAtencion({ paciente }: { paciente: Paciente }) {
  const { e } = useEspecialidad();
  const turno = ultimaAtencion(paciente);
  const profesional = turno ? profesionalDe(turno.profesionalId) : undefined;

  return (
    <>
      <Membrete titulo="Constancia de atención" />
      <DatosDelPaciente paciente={paciente} />

      {turno ? (
        <p className="text-sm leading-relaxed text-gris-800">
          {/*
            «Concurrió» y no «fue atendido»: el participio obliga a saber el género del paciente,
            y el sistema no lo registra. La constancia decía «fue atendido» a las mujeres.
          */}
          Se deja constancia de que{' '}
          <strong>
            {paciente.apellido}, {paciente.nombre}
          </strong>
          , DNI {paciente.documento}, concurrió a este centro el día{' '}
          <strong>{fechaDeDocumento(turno.inicio)}</strong> a las{' '}
          <strong>{hora(turno.inicio)}</strong>
          {profesional && (
            <>
              , donde lo recibió <strong>{profesional.nombre}</strong> ({profesional.matricula})
            </>
          )}
          .
        </p>
      ) : (
        /*
         * **Sin atenciones registradas no se certifica nada.** La versión anterior afirmaba que
         * el paciente había concurrido y le ponía la fecha de hoy, para cualquiera — incluso
         * para quien nunca pisó el centro. Un papel con membrete que afirma un hecho falso es
         * exactamente lo que no puede salir de un sistema.
         */
        <p className="text-sm leading-relaxed text-gris-800">
          <strong>
            {paciente.apellido}, {paciente.nombre}
          </strong>
          , DNI {paciente.documento}, figura registrado en este centro y{' '}
          <strong>no tiene atenciones registradas</strong> a la fecha. No corresponde extender
          constancia de atención.
        </p>
      )}

      {turno && (
        <p className="mt-3 text-sm text-gris-800">
          Se extiende la presente a pedido del interesado, a los fines que estime corresponder.
        </p>
      )}

      <p className="tabular mt-6 text-xs text-gris-600">
        Constancia N° {numeroDeDocumento(paciente, 'constancia')} · no válida como comprobante
        fiscal
      </p>

      <Firmas
        izquierda={
          profesional
            ? `${profesional.nombre} — ${profesional.matricula}`
            : may(e.profesional.singular)
        }
      />
    </>
  );
}

export function Presupuesto({ paciente }: { paciente: Paciente }) {
  const { e } = useEspecialidad();
  const semilla = Number(paciente.id.replace(/\D/g, '')) || 1;

  // Tres o cuatro renglones: un presupuesto de una línea no se presupuesta, se cobra.
  const renglones = [0, 1, 2, 3].slice(0, 3 + (semilla % 2)).map((k) => {
    const i = mezclar(semilla * 7 + k * 3) % e.practicas.length;
    const cantidad = k === 0 ? 1 : ((semilla + k) % 3) + 1;
    const unitario = precioDe(i);
    return { texto: e.practicas[i]!, cantidad, unitario, total: cantidad * unitario };
  });

  const total = renglones.reduce((s, r) => s + r.total, 0);
  const vence = new Date(HOY);
  vence.setDate(vence.getDate() + 30);

  return (
    <>
      <Membrete titulo="Presupuesto" />
      <DatosDelPaciente paciente={paciente} />

      <table className="mb-4 w-full text-sm">
        <thead className="border-y border-gris-800 text-left text-xs font-bold text-gris-800">
          <tr>
            <th className="py-1.5">{may(e.unidad.singular)}</th>
            <th className="w-16 py-1.5 text-right">Cant.</th>
            <th className="w-28 py-1.5 text-right">Unitario</th>
            <th className="w-28 py-1.5 text-right">Importe</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gris-200">
          {renglones.map((r) => (
            <tr key={r.texto}>
              <td className="py-1.5 text-gris-800">{r.texto}</td>
              <td className="tabular py-1.5 text-right text-gris-800">{r.cantidad}</td>
              <td className="tabular py-1.5 text-right text-gris-800">{pesos(r.unitario)}</td>
              <td className="tabular py-1.5 text-right font-medium text-gris-900">
                {pesos(r.total)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-gris-800">
          <tr>
            <td colSpan={3} className="py-2 text-right text-sm font-bold text-gris-900">
              Total
            </td>
            <td className="tabular py-2 text-right text-base font-bold text-gris-900">
              {pesos(total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <Bloque titulo="Condiciones">
        <ul className="space-y-0.5">
          <li>Presupuesto válido hasta el {fechaCorta(vence)}.</li>
          {/* A un paciente particular no se le habla de cobertura: no tiene. */}
          {paciente.obraSocial === 'Particular' ? (
            <li>Atención particular: los importes son los de esta lista, sin cobertura.</li>
          ) : (
            <li>
              Cobertura de {paciente.obraSocial} sujeta a autorización previa. Los importes son
              particulares.
            </li>
          )}
          <li>Los tratamientos se inician una vez aceptado el presupuesto.</li>
        </ul>
      </Bloque>

      <p className="tabular text-xs text-gris-600">
        Presupuesto N° {numeroDeDocumento(paciente, 'presupuesto')} · no válido como comprobante
        fiscal
      </p>

      <Firmas izquierda={may(e.profesional.singular)} derecha="Conformidad del paciente" />
    </>
  );
}

export function FichaDelPaciente({ paciente }: { paciente: Paciente }) {
  const { e } = useEspecialidad();
  const historial = atencionesDe(paciente.id).slice(0, 12);

  return (
    <>
      <Membrete titulo="Ficha del paciente" />
      <DatosDelPaciente paciente={paciente} />

      <Bloque titulo="Contacto">
        <p>
          Teléfono {paciente.telefono} · última visita {fechaCorta(paciente.ultimaVisita)}
          {paciente.deuda > 0 && ` · saldo pendiente ${pesos(paciente.deuda)}`}
        </p>
      </Bloque>

      <Bloque titulo={`${may(e.unidad.plural)} registradas`}>
        {historial.length === 0 ? (
          <p className="text-gris-600">Sin atenciones registradas.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gris-200">
              {historial.map((t) => (
                <tr key={t.id}>
                  <td className="tabular w-24 py-1 text-gris-600">{fechaCorta(t.inicio)}</td>
                  <td className="py-1 text-gris-800">{e.practicas[t.indicePractica]}</td>
                  <td className="py-1 text-right text-gris-600">
                    {profesionalDe(t.profesionalId).nombre}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Bloque>

      <Bloque titulo="Observaciones">
        <div className="mt-1 space-y-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="border-b border-dotted border-gris-400" />
          ))}
        </div>
      </Bloque>
    </>
  );
}

export function Comprobante({ paciente }: { paciente: Paciente }) {
  const { e } = useEspecialidad();
  const turno = ultimaAtencion(paciente);
  // El mismo precio que el presupuesto le pone a esa práctica, no otro.
  const importe = precioDe(turno ? turno.indicePractica : 0);

  return (
    <>
      <Membrete titulo="Comprobante de pago" />
      <DatosDelPaciente paciente={paciente} />

      <p className="text-sm leading-relaxed text-gris-800">
        Recibimos de{' '}
        <strong>
          {paciente.apellido}, {paciente.nombre}
        </strong>{' '}
        la suma de <strong className="tabular">{pesos(importe)}</strong> en concepto de{' '}
        <strong>{turno ? e.practicas[turno.indicePractica] : e.practicas[0]}</strong>
        {turno && <> del día {fechaCorta(turno.inicio)}</>}.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-x-8 text-sm">
        <div className="flex gap-2 border-b border-gris-200 pb-1">
          <span className="w-24 text-gris-600">Medio de pago</span>
          <span className="font-medium text-gris-900">Efectivo</span>
        </div>
        <div className="flex gap-2 border-b border-gris-200 pb-1">
          <span className="w-24 text-gris-600">Saldo</span>
          <span className="tabular font-medium text-gris-900">{pesos(paciente.deuda)}</span>
        </div>
      </div>

      <p className="tabular mt-6 text-xs text-gris-600">
        Comprobante interno N° {numeroDeDocumento(paciente, 'comprobante')} ·{' '}
        <strong>no válido como factura</strong>: la facturación electrónica con numeración de ARCA
        llega con el servidor.
      </p>

      <Firmas izquierda="Por el centro" derecha="Recibí conforme" />
    </>
  );
}

/**
 * Los cuatro, en el orden en que se piden en el mostrador.
 *
 * La constancia primero porque es la que más se pide y casi siempre sobre la marcha: alguien
 * sale de la consulta y la necesita para el trabajo.
 */
export const COMUNES: Documento[] = [
  { nombre: 'Constancia de atención', Componente: ConstanciaDeAtencion },
  { nombre: 'Presupuesto', Componente: Presupuesto },
  { nombre: 'Comprobante', Componente: Comprobante },
  { nombre: 'Ficha del paciente', Componente: FichaDelPaciente },
];
