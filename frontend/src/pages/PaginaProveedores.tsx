/**
 * Proveedores, con su saldo.
 *
 * **Quiénes son los proveedores lo dice la especialidad**: un odontólogo le compra a un
 * laboratorio de prótesis, un clínico a un centro de diagnóstico y un kinesiólogo a un servicio
 * técnico de electromedicina. Esta pantalla no conoce ninguno de los tres.
 *
 * El saldo es lo que se les debe. Va primero porque es la pregunta que se le hace a esta
 * pantalla; el resto son datos de contacto que se consultan de vez en cuando.
 */

import { pesos } from '../datos/consultorio.ts';
import { may, useEspecialidad } from '../especialidades/index.ts';
import { Tarjeta } from '../components/ui.tsx';

export function PaginaProveedores() {
  const { e } = useEspecialidad();
  const PROVEEDORES = e.derivaciones.proveedores;
  const deuda = PROVEEDORES.reduce((s, p) => s + p.saldo, 0);
  const conSaldo = PROVEEDORES.filter((p) => p.saldo > 0).length;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-.025em] text-gris-900">Proveedores</h1>
        <p className="mt-1 text-sm text-gris-600">
          {may(e.derivaciones.destino.plural)}, depósitos y servicios, con su saldo.
        </p>
      </header>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Tarjeta className="p-4">
          <p className="text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">
            Total adeudado
          </p>
          <p className="tabular mt-1.5 text-[28px] leading-none font-bold text-gris-900">
            {pesos(deuda)}
          </p>
          <p className="mt-1.5 text-xs text-gris-600">a {conSaldo} proveedores</p>
        </Tarjeta>
        <Tarjeta className="p-4">
          <p className="text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">
            Laboratorios
          </p>
          <p className="tabular mt-1.5 text-[28px] leading-none font-bold text-gris-900">
            {PROVEEDORES.filter((p) => p.rubro === 'Laboratorio').length}
          </p>
          <p className="mt-1.5 text-xs text-gris-600">con cuenta corriente</p>
        </Tarjeta>
        <Tarjeta className="p-4">
          <p className="text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">
            Proveedores
          </p>
          <p className="tabular mt-1.5 text-[28px] leading-none font-bold text-gris-900">
            {PROVEEDORES.length}
          </p>
          <p className="mt-1.5 text-xs text-gris-600">activos</p>
        </Tarjeta>
      </div>

      <Tarjeta className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-gris-200 bg-gris-50 text-left text-xs font-semibold text-gris-600">
            <tr>
              <th className="px-3 py-2.5">Proveedor</th>
              <th className="px-3 py-2.5">Rubro</th>
              <th className="px-3 py-2.5">CUIT</th>
              <th className="px-3 py-2.5">Contacto</th>
              <th className="px-3 py-2.5">Teléfono</th>
              <th className="px-3 py-2.5 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-100">
            {PROVEEDORES.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2.5 font-medium text-gris-900">{p.nombre}</td>
                <td className="px-3 py-2.5 text-gris-600">{p.rubro}</td>
                <td className="tabular px-3 py-2.5 text-gris-600">{p.cuit}</td>
                <td className="px-3 py-2.5 text-gris-700">{p.contacto}</td>
                <td className="tabular px-3 py-2.5 text-gris-600">{p.telefono}</td>
                <td className="tabular px-3 py-2.5 text-right">
                  {p.saldo > 0 ? (
                    <span className="font-medium text-gris-900">{pesos(p.saldo)}</span>
                  ) : (
                    <span className="text-gris-500">al día</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>
    </div>
  );
}
