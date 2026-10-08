/**
 * La tienda del centro.
 *
 * **Lo que más se vende no son productos: son bonos de sesiones prepagas.** Un cepillo o una
 * férula dejan margen; un bono de diez sesiones pagado por adelantado deja **caja previsible**,
 * que es el problema financiero real de un consultorio chico — factura cuando atiende, y los
 * meses flojos no los cubre nadie.
 *
 * Por eso los bonos van primero y con su propia presentación, no mezclados en una grilla de
 * artículos. Y por eso el bono dice cuánto ahorra: es lo que decide la compra.
 *
 * El circuito se recorre entero y **no cobra**. El botón lo dice: la pasarela y la conciliación
 * llegan con el servidor, y prometer un cobro que no existe es de las cosas que después hay que
 * desandar delante del cliente.
 */

import { useMemo, useState } from 'react';
import { PACIENTES, fechaCorta, HOY, pesos } from '../datos/consultorio.ts';
import { agregarBono } from './bonos.ts';
import { may, useEspecialidad, type ProductoDeTienda } from '../especialidades/index.ts';
import { Encabezado } from './Marco.tsx';
import { useTitulo } from './seo.ts';

/**
 * Lo que se vende. Un bono trae `unidades`; un producto, no.
 *
 * Extiende el tipo de la vertical en vez de duplicarlo: los productos vienen de ahí y un segundo
 * tipo con los mismos campos es exactamente lo que después se desincroniza.
 */
interface Articulo extends ProductoDeTienda {
  /**
   * Cuántas unidades de atención trae, si es un bono. Los productos no traen.
   *
   * Se llama `unidades` y no `sesiones` **porque el núcleo no habla kinesiólogo**: el mismo bono
   * es de diez sesiones, de diez consultas o de diez prácticas según el centro.
   */
  unidades?: number;
}

/** Cuánto vale una atención suelta, que es contra lo que se compara el bono. */
const PRECIO_SUELTO = 24_000;

const BONOS: Articulo[] = [
  { id: 'b1', nombre: 'Bono de 5', detalle: '', precio: 110_000, unidades: 5, rubro: 'Bono' },
  { id: 'b2', nombre: 'Bono de 10', detalle: '', precio: 204_000, unidades: 10, rubro: 'Bono' },
  { id: 'b3', nombre: 'Bono de 20', detalle: '', precio: 384_000, unidades: 20, rubro: 'Bono' },
];

type Carrito = Record<string, number>;

export function PaginaTienda() {
  const { e } = useEspecialidad();
  /*
   * **Los productos son de la vertical, los bonos no.** Un bono es una unidad de atención
   * prepaga y existe en las tres; una férula de descarga no la vende un kinesiólogo y una faja
   * lumbar no la vende un odontólogo. El catálogo entero se veía igual en las tres, mientras el
   * resto de la pantalla sí cambiaba.
   */
  const PRODUCTOS: Articulo[] = e.productos;
  useTitulo('Tienda', `Bonos de ${e.unidad.plural} y productos, con retiro en el centro.`);
  const [carrito, setCarrito] = useState<Carrito>({});
  const [comprado, setComprado] = useState(false);
  /*
   * **A nombre de quién se emite el bono.** La compra no lo preguntaba, así que el criterio de
   * `HU-011` —«el bono comprado se refleja como unidades disponibles en la ficha del paciente»—
   * no podía cumplirse de ninguna manera: no había a qué ficha ir. En el mostrador el bono se
   * emite a nombre de alguien; acá también.
   */
  const [pacienteId, setPacienteId] = useState('');

  const agregar = (id: string) => setCarrito((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const quitar = (id: string) =>
    setCarrito((c) => {
      const cantidad = (c[id] ?? 0) - 1;
      const { [id]: _, ...resto } = c;
      return cantidad > 0 ? { ...resto, [id]: cantidad } : resto;
    });

  const todos = useMemo(() => [...BONOS, ...PRODUCTOS], [PRODUCTOS]);
  const renglones = Object.entries(carrito).map(([id, cantidad]) => ({
    articulo: todos.find((a) => a.id === id)!,
    cantidad,
  }));
  const total = renglones.reduce((s, r) => s + r.articulo.precio * r.cantidad, 0);
  const unidadesCompradas = renglones.reduce(
    (s, r) => s + (r.articulo.unidades ?? 0) * r.cantidad,
    0,
  );

  if (comprado) {
    return (
      <>
        <Encabezado titulo="Listo" />
        <div className="mx-auto max-w-2xl px-4 pb-10">
          <div className="rounded-[12px] border border-marca-100 bg-marca-50 p-6">
            <p className="text-base text-marca-900">
              Tu pedido quedó registrado por <strong className="tabular">{pesos(total)}</strong>.
            </p>
            {unidadesCompradas > 0 && (
              <p className="mt-2 text-sm text-marca-800">
                Las{' '}
                <strong>
                  {unidadesCompradas} {e.unidad.plural}
                </strong>{' '}
                del bono quedan disponibles en tu ficha: el centro las descuenta a medida que las
                usás.
              </p>
            )}
          </div>
          <p className="mt-4 text-sm text-gris-600">
            <strong>No se cobró nada.</strong> El checkout de esta demostración recorre el circuito
            entero pero no tiene pasarela conectada: eso llega con el servidor.
          </p>
          <button
            type="button"
            onClick={() => {
              setComprado(false);
              setCarrito({});
              setPacienteId('');
            }}
            className="mt-5 rounded-[10px] border border-gris-300 px-4 py-2 text-sm text-gris-700 transition-colors hover:bg-gris-50"
          >
            Volver a la tienda
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Encabezado
        titulo="Tienda"
        bajada={`Bonos de ${e.unidad.plural} y productos, con retiro en el centro.`}
      />

      <div className="mx-auto max-w-5xl px-4 pb-12">
        <section aria-labelledby="bonos" className="mb-10">
          <h2 id="bonos" className="text-[22px] font-bold tracking-[-.02em] text-gris-900">
            Bonos de {e.unidad.plural}
          </h2>
          <p className="mt-1.5 text-sm text-gris-600">
            Se pagan una vez y se usan cuando quieras. {may(e.unidad.singular)} suelta:{' '}
            <span className="tabular">{pesos(PRECIO_SUELTO)}</span>.
          </p>

          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {BONOS.map((b) => {
              const porSesion = Math.round(b.precio / b.unidades!);
              const ahorro = PRECIO_SUELTO * b.unidades! - b.precio;
              const enCarrito = carrito[b.id] ?? 0;
              return (
                <li
                  key={b.id}
                  className="flex flex-col rounded-[12px] border border-marca-100 bg-marca-50 p-5"
                >
                  <p className="text-sm font-semibold text-marca-800">{b.nombre}</p>
                  <p className="tabular mt-1 text-[26px] leading-none font-bold text-gris-900">
                    {pesos(b.precio)}
                  </p>
                  <p className="tabular mt-1 text-xs text-gris-600">
                    {pesos(porSesion)} por {e.unidad.singular}
                  </p>
                  {/* Lo que decide la compra: cuánto ahorra contra pagarlas sueltas. */}
                  <p className="tabular mt-2 text-sm font-medium text-marca-700">
                    Ahorrás {pesos(ahorro)}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => agregar(b.id)}
                      className="flex-1 rounded-[9px] bg-marca-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-marca-700"
                    >
                      Agregar
                    </button>
                    {enCarrito > 0 && (
                      <span className="tabular text-sm text-marca-800">×{enCarrito}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="productos">
          <h2 id="productos" className="text-[22px] font-bold tracking-[-.02em] text-gris-900">
            Productos
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTOS.map((a) => {
              const enCarrito = carrito[a.id] ?? 0;
              return (
                <li key={a.id} className="flex flex-col rounded-[12px] border border-gris-200 p-5">
                  <p className="text-[11px] font-semibold tracking-[.08em] text-gris-500 uppercase">
                    {a.rubro}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gris-900">{a.nombre}</p>
                  <p className="mt-1 flex-1 text-sm text-gris-600">{a.detalle}</p>
                  <p className="tabular mt-3 text-lg font-bold text-gris-900">{pesos(a.precio)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => agregar(a.id)}
                      className="flex-1 rounded-[9px] border border-gris-300 px-3 py-2 text-sm font-medium text-gris-800 transition-colors hover:border-marca-300 hover:bg-marca-50"
                    >
                      Agregar
                    </button>
                    {enCarrito > 0 && (
                      <span className="tabular text-sm text-gris-700">×{enCarrito}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {renglones.length > 0 && (
        <div className="sticky bottom-0 border-t border-gris-200 bg-white/97 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 py-4">
            <ul className="mb-3 space-y-1 text-sm">
              {renglones.map((r) => (
                <li key={r.articulo.id} className="flex items-baseline gap-3">
                  <span className="tabular w-8 shrink-0 text-gris-600">×{r.cantidad}</span>
                  <span className="min-w-0 flex-1 truncate text-gris-800">{r.articulo.nombre}</span>
                  <span className="tabular text-gris-900">
                    {pesos(r.articulo.precio * r.cantidad)}
                  </span>
                  <button
                    type="button"
                    onClick={() => quitar(r.articulo.id)}
                    aria-label={`Quitar uno de ${r.articulo.nombre}`}
                    className="shrink-0 text-xs text-gris-500 underline hover:text-rojo-700"
                  >
                    quitar
                  </button>
                </li>
              ))}
            </ul>

            {unidadesCompradas > 0 && (
              <label className="mb-3 block border-t border-gris-200 pt-3 text-sm">
                <span className="mb-1 block font-medium text-gris-900">
                  ¿A nombre de quién va el bono?
                </span>
                <select
                  value={pacienteId}
                  onChange={(ev) => setPacienteId(ev.target.value)}
                  className="w-full max-w-sm rounded-[10px] border border-gris-300 bg-white px-3 py-2 text-sm text-gris-900"
                >
                  <option value="">Elegí el paciente…</option>
                  {PACIENTES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.apellido}, {p.nombre} — DNI {p.documento}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-gris-600">
                  Las {e.unidad.plural} quedan disponibles en su ficha, y el centro las descuenta a
                  medida que las usa.
                </span>
              </label>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-gris-200 pt-3">
              <p className="text-sm text-gris-700">
                Total{' '}
                <span className="tabular text-xl font-bold text-gris-900">{pesos(total)}</span>
                {unidadesCompradas > 0 && (
                  <span className="ml-2 text-xs text-gris-600">
                    incluye {unidadesCompradas} {e.unidad.plural}
                  </span>
                )}
              </p>
              <button
                type="button"
                disabled={unidadesCompradas > 0 && !pacienteId}
                onClick={() => {
                  if (unidadesCompradas > 0 && pacienteId) {
                    agregarBono(pacienteId, unidadesCompradas, fechaCorta(HOY));
                  }
                  setComprado(true);
                }}
                className="ml-auto rounded-[10px] bg-marca-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marca-700"
              >
                Finalizar compra
              </button>
            </div>
            <p className="mt-2 text-xs text-gris-500">
              El checkout recorre el circuito y no cobra: la pasarela llega con el servidor.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
