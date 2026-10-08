/**
 * El ida y vuelta con quien recibe el trabajo del centro.
 *
 * **Es el módulo que ningún software genérico tiene**, y el que más le habla a quien lo sufre:
 * algo salió del centro, alguien lo tiene, y tiene que volver. Hoy eso se lleva en un cuaderno o
 * en un grupo de WhatsApp, y cuando no vuelve a tiempo hay un paciente esperando para nada.
 *
 * **Pero no es la misma cosa en las tres especialidades**, y por eso todo lo que se nombra sale
 * de `especialidad.derivaciones`: el odontólogo manda una pieza física a un laboratorio de
 * prótesis y la espera de vuelta; el clínico deriva un estudio a un centro de diagnóstico y
 * espera un informe —sin cadete: el informe vuelve por sistema—; el kinesiólogo manda un equipo
 * a reparar o calibrar.
 *
 * La primera versión estaba escrita entera en odontólogo —«Puente de tres unidades — 24 a 26»,
 * «Prótesis del Norte»— y se veía igual en las tres. La demo abre en medicina general: un
 * clínico la leía y cerraba la demostración ahí.
 *
 * Por eso lo primero que se ve son **los demorados**, no la lista completa.
 */

import {
  ENVIOS,
  ESTADOS_ENVIO,
  HOY,
  fechaCorta,
  pacienteDe,
  type Envio,
  type EstadoEnvio,
} from '../datos/consultorio.ts';
import { may, useEspecialidad } from '../especialidades/index.ts';
import { Tarjeta } from '../components/ui.tsx';

const CLASE_ESTADO: Record<EstadoEnvio, string> = {
  preparado: 'bg-gris-100 text-gris-700 border-gris-300',
  enCamino: 'bg-ambar-50 text-ambar-700 border-ambar-100',
  enLaboratorio: 'bg-tinta-50 text-tinta-700 border-tinta-200',
  devuelto: 'bg-marca-50 text-marca-800 border-marca-100',
  demorado: 'bg-rojo-50 text-rojo-800 border-rojo-100',
};

export function PaginaLaboratorio() {
  const { e } = useEspecialidad();
  const d = e.derivaciones;

  const demorados = ENVIOS.filter((env) => env.estado === 'demorado');
  const enCurso = ENVIOS.filter((env) => env.estado !== 'devuelto' && env.estado !== 'demorado');
  const cerrados = ENVIOS.filter((env) => env.estado === 'devuelto');

  const dias = (f: Date) => Math.round((f.getTime() - HOY.getTime()) / 86_400_000);

  const fila = (env: Envio) => {
    const p = pacienteDe(env.pacienteId);
    const prov = d.proveedores[env.indiceProveedor] ?? d.proveedores[0]!;
    const faltan = dias(env.regreso);
    return (
      <tr key={env.id}>
        <td className="px-3 py-2.5 font-medium text-gris-900">
          {d.trabajos[env.indiceTrabajo] ?? d.trabajos[0]}
        </td>
        <td className="px-3 py-2.5 text-gris-700">
          {p.apellido}, {p.nombre}
        </td>
        <td className="px-3 py-2.5 text-gris-600">{prov.nombre}</td>
        {d.conCadete && <td className="px-3 py-2.5 text-gris-600">{env.cadete}</td>}
        <td className="tabular px-3 py-2.5 text-gris-600">{fechaCorta(env.salida)}</td>
        <td className="tabular px-3 py-2.5">
          <span className={faltan < 0 ? 'font-medium text-rojo-700' : 'text-gris-700'}>
            {fechaCorta(env.regreso)}
          </span>
          <span className="ml-2 text-xs text-gris-500">
            {faltan < 0
              ? `${Math.abs(faltan)} días tarde`
              : faltan === 0
                ? 'hoy'
                : `en ${faltan} días`}
          </span>
        </td>
        <td className="px-3 py-2.5">
          <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${CLASE_ESTADO[env.estado]}`}
          >
            {ESTADOS_ENVIO[env.estado].etiqueta}
          </span>
        </td>
      </tr>
    );
  };

  const tabla = (titulo: string, envios: Envio[], tono?: 'alerta') => (
    <section className="mb-6">
      <h2
        className={`mb-2 text-sm font-semibold ${tono === 'alerta' ? 'text-rojo-800' : 'text-gris-800'}`}
      >
        {titulo} <span className="font-normal text-gris-500">({envios.length})</span>
      </h2>
      <Tarjeta className={`overflow-x-auto ${tono === 'alerta' ? 'border-rojo-600' : ''}`}>
        <table className="w-full min-w-[840px] text-sm">
          <thead className="border-b border-gris-200 bg-gris-50 text-left text-xs font-semibold text-gris-600">
            <tr>
              <th className="px-3 py-2.5">{may(d.unidad.singular)}</th>
              <th className="px-3 py-2.5">Paciente</th>
              <th className="px-3 py-2.5">{may(d.destino.singular)}</th>
              {d.conCadete && <th className="px-3 py-2.5">Cadete</th>}
              <th className="px-3 py-2.5">Salió</th>
              <th className="px-3 py-2.5">Vuelve</th>
              <th className="px-3 py-2.5">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-100">{envios.map(fila)}</tbody>
        </table>
        {envios.length === 0 && (
          <p className="p-6 text-center text-sm text-gris-600">Nada por acá.</p>
        )}
      </Tarjeta>
    </section>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-.025em] text-gris-900">{d.titulo}</h1>
        <p className="mt-1 text-sm text-gris-600">{d.bajada}</p>
      </header>

      {demorados.length > 0 && tabla('Demorados', demorados, 'alerta')}
      {tabla('En curso', enCurso)}
      {tabla('Devueltos', cerrados)}
    </div>
  );
}
