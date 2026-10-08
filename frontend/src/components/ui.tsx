/**
 * Piezas de interfaz compartidas.
 *
 * Tailwind resuelve el estilo, pero no da componentes: esto es la capa mínima
 * para que los formularios y los listados del sistema se vean iguales entre sí.
 * Las medidas y los colores salen de los tokens de estilos.css.
 */

import { useEffect, useRef } from 'react';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

type VarianteBoton =
  | 'primario'
  | 'secundario'
  | 'peligro'
  | 'peligroSuave'
  | 'advertencia'
  | 'advertenciaSuave'
  | 'neutro';

/**
 * Botón con borde y color en todas sus variantes.
 *
 * Un botón secundario blanco sobre blanco con un borde gris claro "no se ve".
 * Por eso cada variante tiene borde y un color que la
 * identifica, y `neutro` queda para acciones que no son la principal.
 */
export function Boton({
  variante = 'primario',
  tamano = 'normal',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
  tamano?: 'normal' | 'chico';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[9px] border font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2';
  const tamanos = {
    normal: 'px-3.5 py-2 text-sm',
    chico: 'px-2.5 py-1 text-xs',
  } as const;
  const variantes: Record<VarianteBoton, string> = {
    primario:
      'border-marca-700 bg-marca-600 text-white hover:bg-marca-700 focus-visible:outline-marca-600',
    secundario:
      'border-marca-600 bg-white text-marca-700 hover:bg-marca-50 focus-visible:outline-marca-600',
    peligro:
      'border-rojo-700 bg-rojo-600 text-white hover:bg-rojo-700 focus-visible:outline-rojo-600',
    peligroSuave:
      'border-rojo-600 bg-white text-rojo-700 hover:bg-rojo-50 focus-visible:outline-rojo-600',
    advertencia:
      'border-ambar-700 bg-ambar-600 text-white hover:bg-ambar-700 focus-visible:outline-ambar-600',
    advertenciaSuave:
      'border-ambar-600 bg-white text-ambar-700 hover:bg-ambar-50 focus-visible:outline-ambar-600',
    neutro:
      'border-gris-300 bg-white text-gris-800 hover:bg-gris-100 focus-visible:outline-gris-500',
  };

  return (
    <button
      type={type}
      className={`${base} ${tamanos[tamano]} ${variantes[variante]} ${className}`}
      {...props}
    />
  );
}

export function Campo({
  etiqueta,
  error,
  ayuda,
  children,
}: {
  etiqueta: string;
  error?: string | undefined;
  ayuda?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gris-800">{etiqueta}</span>
      {children}
      {ayuda && !error && <span className="mt-1.5 block text-xs text-gris-600">{ayuda}</span>}
      {error && (
        <span role="alert" className="mt-1.5 block text-sm text-rojo-700">
          {error}
        </span>
      )}
    </label>
  );
}

const claseControl =
  'block w-full rounded-[9px] border border-gris-300 bg-white px-[13px] py-[11px] text-sm text-gris-900 shadow-[inset_0_1px_2px_rgba(17,33,42,.04)] placeholder:text-gris-400 focus:border-marca-500 focus:ring-2 focus:ring-marca-500/20 focus:outline-none disabled:bg-gris-100';

export function Entrada({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${claseControl} ${className}`} {...props} />;
}

export function Selector({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${claseControl} ${className}`} {...props}>
      {children}
    </select>
  );
}

/**
 * `ref` va declarada a mano: en React 19 es una prop común, pero
 * `TextareaHTMLAttributes` no la incluye y sin esto no se puede pedir el
 * elemento (lo necesita la plantilla del boleto, para insertar un token donde
 * está el cursor).
 */
export function AreaTexto({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }) {
  return <textarea className={`${claseControl} ${className}`} rows={3} {...props} />;
}

export function Aviso({
  tono = 'error',
  children,
}: {
  tono?: 'error' | 'advertencia' | 'info' | 'exito';
  children: ReactNode;
}) {
  const tonos = {
    error: 'border-rojo-100 bg-rojo-50 text-rojo-800',
    advertencia: 'border-ambar-100 bg-ambar-50 text-ambar-700',
    info: 'border-gris-200 bg-gris-50 text-gris-700',
    exito: 'border-marca-100 bg-marca-50 text-marca-800',
  } as const;

  return (
    <div
      role={tono === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-3.5 py-2.5 text-sm ${tonos[tono]}`}
    >
      {children}
    </div>
  );
}

export function Etiqueta({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
        activo ? 'bg-marca-50 text-marca-800' : 'bg-gris-100 text-gris-600'
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${activo ? 'bg-marca-600' : 'bg-gris-400'}`}
      />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

/**
 * Tarjeta base para agrupar contenido (listados, formularios, fichas).
 *
 * Borde suave + sombra en capas del prototipo, en vez del `shadow-sm` plano
 * que se repetía copiado en cada página.
 */
export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-gris-200 bg-white shadow-[0_1px_2px_rgba(17,33,42,.045),0_12px_28px_-18px_rgba(17,33,42,.16)] ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Confirmación antes de una acción destructiva.
 *
 * Usa `<dialog>` nativo: trae el foco atrapado, Escape para cerrar y el fondo
 * inerte sin librerías.
 */
export function DialogoConfirmacion({
  abierto,
  titulo,
  children,
  textoConfirmar = 'Confirmar',
  peligroso = true,
  ocupado = false,
  alConfirmar,
  alCancelar,
}: {
  abierto: boolean;
  titulo: string;
  children: ReactNode;
  textoConfirmar?: string;
  peligroso?: boolean;
  ocupado?: boolean;
  alConfirmar: () => void;
  alCancelar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialogo-titulo"
      onCancel={(e) => {
        e.preventDefault();
        alCancelar();
      }}
      className="m-auto w-full max-w-md rounded-xl border border-gris-200 p-0 shadow-xl backdrop:bg-tinta-950/40"
    >
      <div className="p-5">
        <h2 id="dialogo-titulo" className="text-[15px] font-bold text-gris-900">
          {titulo}
        </h2>
        <div className="mt-2 text-sm text-gris-600">{children}</div>
      </div>
      <div className="flex justify-end gap-2 border-t border-gris-100 bg-gris-50 px-5 py-3">
        <Boton variante="neutro" onClick={alCancelar} disabled={ocupado}>
          Cancelar
        </Boton>
        <Boton
          variante={peligroso ? 'peligro' : 'primario'}
          onClick={alConfirmar}
          disabled={ocupado}
        >
          {ocupado ? 'Procesando…' : textoConfirmar}
        </Boton>
      </div>
    </dialog>
  );
}

/** Pestañas accesibles (rol `tablist`) para las subsecciones de una ficha. */
export function Pestanas<T extends string>({
  opciones,
  activa,
  alCambiar,
  etiqueta,
}: {
  opciones: { valor: T; texto: string }[];
  activa: T;
  alCambiar: (valor: T) => void;
  etiqueta: string;
}) {
  return (
    <div role="tablist" aria-label={etiqueta} className="flex gap-1 border-b border-gris-200">
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="tab"
          aria-selected={activa === o.valor}
          onClick={() => alCambiar(o.valor)}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            activa === o.valor
              ? 'border-marca-600 text-marca-700'
              : 'border-transparent text-gris-600 hover:border-gris-300 hover:text-gris-800'
          }`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

/**
 * Grupo de casillas para elegir varios valores a la vez (tipos de usuario,
 * permisos de un rol…). No hay ningún multi-select en el kit todavía; esto es
 * lo mínimo accesible sin traer una librería.
 */
export function GrupoCasillas<T extends string>({
  opciones,
  seleccionados,
  alCambiar,
  columnas = 1,
}: {
  opciones: { valor: T; etiqueta: string }[];
  seleccionados: T[];
  alCambiar: (valores: T[]) => void;
  columnas?: 1 | 2;
}) {
  function alternar(valor: T) {
    alCambiar(
      seleccionados.includes(valor)
        ? seleccionados.filter((v) => v !== valor)
        : [...seleccionados, valor],
    );
  }

  return (
    <div className={columnas === 2 ? 'grid grid-cols-1 gap-2 sm:grid-cols-2' : 'space-y-2'}>
      {opciones.map((o) => (
        <label key={o.valor} className="flex items-center gap-2 text-sm text-gris-800">
          <input
            type="checkbox"
            checked={seleccionados.includes(o.valor)}
            onChange={() => alternar(o.valor)}
            className="size-4 rounded border-gris-300 text-marca-600 focus:ring-2 focus:ring-marca-500/30"
          />
          {o.etiqueta}
        </label>
      ))}
    </div>
  );
}

/** Paginación de servidor: el total viene de la API. */
export function Paginador({
  pagina,
  porPagina,
  total,
  alCambiar,
}: {
  pagina: number;
  porPagina: number;
  total: number;
  alCambiar: (pagina: number) => void;
}) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  if (total === 0) return null;

  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, total);

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-between gap-3 px-1 py-3 text-sm text-gris-600"
    >
      <span>
        {desde}–{hasta} de {total}
      </span>
      <div className="flex gap-2">
        <Boton
          variante="neutro"
          tamano="chico"
          disabled={pagina <= 1}
          onClick={() => alCambiar(pagina - 1)}
        >
          Anterior
        </Boton>
        <Boton
          variante="neutro"
          tamano="chico"
          disabled={pagina >= paginas}
          onClick={() => alCambiar(pagina + 1)}
        >
          Siguiente
        </Boton>
      </div>
    </nav>
  );
}
