/**
 * Comprobantes emitidos y recibidos.
 *
 * En la etapa dos esta pantalla importaría «Mis Comprobantes» de ARCA.
 * Acá los comprobantes están sembrados.
 */

import { useState } from 'react';
import { COMPROBANTES, fechaCorta, pesos } from '../datos/consultorio.ts';
import { Aviso, Selector, Tarjeta } from '../components/ui.tsx';
import { useEspecialidad } from '../especialidades/index.ts';

export function PaginaFacturacion() {
  const { e } = useEspecialidad();
  const [sentido, setSentido] = useState<'todos' | 'emitido' | 'recibido'>('todos');
  const visibles = COMPROBANTES.filter((c) => sentido === 'todos' || c.sentido === sentido);
  /**
   * Una nota de crédito **resta**.
   *
   * La versión anterior sumaba todo en positivo, así que el total de facturación y el del libro
   * IVA salían inflados. Es el defecto que un contador ve de inmediato y el que más caro sale en
   * una demostración: si los números no cierran, no importa lo linda que esté la pantalla.
   */
  const signo = (c: (typeof visibles)[number]) => (c.tipo.startsWith('Nota de crédito') ? -1 : 1);
  const total = visibles.reduce((s, c) => s + signo(c) * c.total, 0);
  const iva = visibles.reduce((s, c) => s + c.iva, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-.025em] text-gris-900">
          Facturación y ARCA
        </h1>
        <p className="mt-1 text-sm text-gris-600">Comprobantes emitidos y recibidos.</p>
      </header>

      <Aviso tono="info">
        En esta etapa los comprobantes están cargados de ejemplo. La importación de «Mis
        Comprobantes» de ARCA se conecta en la etapa dos: el lector ya está escrito y probado contra
        los archivos reales del organismo.
      </Aviso>

      <div className="mt-5 mb-5 grid gap-3 sm:grid-cols-3">
        <Tarjeta className="p-4">
          <p className="text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">
            Comprobantes
          </p>
          <p className="tabular mt-1.5 text-[28px] leading-none font-bold text-gris-900">
            {visibles.length}
          </p>
        </Tarjeta>
        <Tarjeta className="p-4">
          <p className="text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">Total</p>
          <p className="tabular mt-1.5 text-[28px] leading-none font-bold text-gris-900">
            {pesos(total)}
          </p>
        </Tarjeta>
        <Tarjeta className="p-4">
          <p className="text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">IVA</p>
          <p className="tabular mt-1.5 text-[28px] leading-none font-bold text-gris-900">
            {pesos(iva)}
          </p>
        </Tarjeta>
      </div>

      <div className="mb-4">
        <Selector
          aria-label="Qué comprobantes"
          className="w-auto"
          value={sentido}
          onChange={(e) => setSentido(e.target.value as 'todos' | 'emitido' | 'recibido')}
        >
          <option value="todos">Emitidos y recibidos</option>
          <option value="emitido">Sólo emitidos</option>
          <option value="recibido">Sólo recibidos</option>
        </Selector>
      </div>

      <Tarjeta className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-gris-200 bg-gris-50 text-left text-xs font-semibold text-gris-600">
            <tr>
              <th className="px-3 py-2.5">Fecha</th>
              <th className="px-3 py-2.5">Tipo</th>
              <th className="px-3 py-2.5">Número</th>
              <th className="px-3 py-2.5">Razón social</th>
              <th className="px-3 py-2.5">CUIT</th>
              <th className="px-3 py-2.5 text-right">Neto</th>
              <th className="px-3 py-2.5 text-right">IVA</th>
              <th className="px-3 py-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-100">
            {visibles.map((c) => (
              <tr key={c.id}>
                <td className="tabular px-3 py-2.5 text-gris-600">{fechaCorta(c.fecha)}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      c.sentido === 'emitido'
                        ? 'border-marca-100 bg-marca-50 text-marca-800'
                        : 'border-tinta-200 bg-tinta-50 text-tinta-700'
                    }`}
                  >
                    {c.tipo}
                  </span>
                </td>
                <td className="tabular px-3 py-2.5 text-gris-700">{c.numero}</td>
                <td className="px-3 py-2.5 font-medium text-gris-900">
                  {c.indiceProveedor === null
                    ? c.razonSocial
                    : (e.derivaciones.proveedores[c.indiceProveedor]?.nombre ?? '—')}
                </td>
                <td className="tabular px-3 py-2.5 text-gris-600">
                  {c.indiceProveedor === null
                    ? c.identificacion
                    : `CUIT ${e.derivaciones.proveedores[c.indiceProveedor]?.cuit ?? ''}`}
                </td>
                <td className="tabular px-3 py-2.5 text-right text-gris-700">{pesos(c.neto)}</td>
                <td className="tabular px-3 py-2.5 text-right text-gris-600">{pesos(c.iva)}</td>
                <td className="tabular px-3 py-2.5 text-right font-medium text-gris-900">
                  {pesos(c.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>
    </div>
  );
}
