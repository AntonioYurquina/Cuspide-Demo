/**
 * El conmutador de especialidad. **Es de la demo, y el código lo dice.**
 *
 * Es el argumento de venta de todo el producto hecho un control: contarle a alguien que el
 * sistema sirve para cualquier especialidad no le dice nada; **cambiarlo delante de él en dos
 * segundos**, sí. Se ve cómo la agenda pasa de decir «Consultorio» a decir «Camilla», cómo
 * cambia la ficha clínica y cómo cambian los documentos que imprime.
 *
 * **En producción esto no existe.** La especialidad se define al alta del consultorio y cambiarla
 * después implica migrar datos clínicos, que es una operación y no un menú. Cuando haya backend,
 * este componente se borra —`features/demo/` entera se borra— y el proveedor lee la especialidad
 * del consultorio. Ninguna pantalla se entera, porque ninguna lo importa: todas usan
 * `useEspecialidad()`.
 *
 * Vive en `features/demo/` justamente para que el día de borrarlo no haya que buscarlo.
 */

import {
  ESPECIALIDADES,
  useEspecialidad,
  type ClaveEspecialidad,
} from '../../especialidades/index.ts';

const CLAVES = Object.keys(ESPECIALIDADES) as ClaveEspecialidad[];

export function ConmutadorEspecialidad() {
  const { e, cambiar } = useEspecialidad();

  return (
    <div className="flex items-center gap-2">
      {/*
        Se nombra «Demostración» a la vista en vez de disimularlo. Un control que cambia el
        sistema entero y parece parte del producto es el tipo de cosa que después alguien toca en
        una reunión pensando que es una configuración.
      */}
      <span className="hidden text-[11px] font-semibold tracking-[.1em] text-tinta-400 uppercase lg:inline">
        Demostración
      </span>
      <label className="sr-only" htmlFor="conmutador-especialidad">
        Especialidad del consultorio
      </label>
      <select
        id="conmutador-especialidad"
        value={e.clave}
        onChange={(ev) => cambiar(ev.target.value as ClaveEspecialidad)}
        className="rounded-[9px] border border-tinta-borde bg-tinta-900 px-2.5 py-1.5 text-sm text-tinta-100 transition-colors hover:bg-tinta-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-300"
      >
        {CLAVES.map((clave) => (
          <option key={clave} value={clave}>
            {ESPECIALIDADES[clave].nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
