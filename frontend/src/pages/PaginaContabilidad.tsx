/**
 * Contabilidad: el libro IVA, armado sobre los comprobantes.
 *
 * Se agrupa por mes porque así se presenta, y el total de cada mes va al pie de su bloque: un
 * libro cuyo total no se puede conciliar mes a mes no sirve para lo que se usa.
 */

import { COMPROBANTES, pesos } from '../datos/consultorio.ts';
import { Tarjeta } from '../components/ui.tsx';

export function PaginaContabilidad() {
  const meses = new Map<string, typeof COMPROBANTES>();
  for (const c of [...COMPROBANTES].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())) {
    const clave = c.fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    meses.set(clave, [...(meses.get(clave) ?? []), c]);
  }

  const ventas = COMPROBANTES.filter((c) => c.sentido === 'emitido');
  const compras = COMPROBANTES.filter((c) => c.sentido === 'recibido');
  const ivaVentas = ventas.reduce((s, c) => s + c.iva, 0);
  const ivaCompras = compras.reduce((s, c) => s + c.iva, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-.025em] text-gris-900">Contabilidad</h1>
        <p className="mt-1 text-sm text-gris-600">Libro IVA, agrupado por mes.</p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Tarjeta className="p-4">
          <p className="text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">
            IVA ventas
          </p>
          <p className="tabular mt-1.5 text-[26px] leading-none font-bold text-gris-900">
            {pesos(ivaVentas)}
          </p>
          <p className="mt-1.5 text-xs text-gris-600">{ventas.length} comprobantes emitidos</p>
        </Tarjeta>
        <Tarjeta className="p-4">
          <p className="text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">
            IVA compras
          </p>
          <p className="tabular mt-1.5 text-[26px] leading-none font-bold text-gris-900">
            {pesos(ivaCompras)}
          </p>
          <p className="mt-1.5 text-xs text-gris-600">{compras.length} comprobantes recibidos</p>
        </Tarjeta>
        <Tarjeta className={`p-4 ${ivaVentas - ivaCompras > 0 ? 'border-ambar-600' : ''}`}>
          <p className="text-[11px] font-semibold tracking-[.1em] text-gris-500 uppercase">
            Posición
          </p>
          <p className="tabular mt-1.5 text-[26px] leading-none font-bold text-gris-900">
            {pesos(Math.abs(ivaVentas - ivaCompras))}
          </p>
          <p className="mt-1.5 text-xs text-gris-600">
            {ivaVentas - ivaCompras > 0 ? 'a pagar' : 'saldo a favor'}
          </p>
        </Tarjeta>
      </div>

      {[...meses.entries()].map(([mes, comprobantes]) => {
        const totalMes = comprobantes.reduce((s, c) => s + c.total, 0);
        const ivaMes = comprobantes.reduce((s, c) => s + c.iva, 0);
        return (
          <section key={mes} className="mb-5">
            <h2 className="mb-2 text-sm font-semibold text-gris-800 capitalize">{mes}</h2>
            <Tarjeta className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="border-b border-gris-200 bg-gris-50 text-left text-xs font-semibold text-gris-600">
                  <tr>
                    <th className="px-3 py-2.5">Tipo</th>
                    <th className="px-3 py-2.5">Número</th>
                    <th className="px-3 py-2.5">Razón social</th>
                    <th className="px-3 py-2.5 text-right">Neto</th>
                    <th className="px-3 py-2.5 text-right">IVA</th>
                    <th className="px-3 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gris-100">
                  {comprobantes.map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 py-2.5 text-gris-700">{c.tipo}</td>
                      <td className="tabular px-3 py-2.5 text-gris-600">{c.numero}</td>
                      <td className="px-3 py-2.5 text-gris-900">{c.razonSocial}</td>
                      <td className="tabular px-3 py-2.5 text-right text-gris-700">
                        {pesos(c.neto)}
                      </td>
                      <td className="tabular px-3 py-2.5 text-right text-gris-600">
                        {pesos(c.iva)}
                      </td>
                      <td className="tabular px-3 py-2.5 text-right text-gris-900">
                        {pesos(c.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gris-300 bg-gris-50 text-sm font-semibold">
                  <tr>
                    <td colSpan={4} className="px-3 py-2.5 text-right text-gris-700">
                      Total del mes
                    </td>
                    <td className="tabular px-3 py-2.5 text-right text-gris-900">
                      {pesos(ivaMes)}
                    </td>
                    <td className="tabular px-3 py-2.5 text-right text-gris-900">
                      {pesos(totalMes)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Tarjeta>
          </section>
        );
      })}
    </div>
  );
}
