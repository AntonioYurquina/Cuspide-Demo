/**
 * Los turnos pedidos desde el sitio, que todavía nadie confirmó.
 *
 * ## Por qué esto existe, si «esta etapa no guarda»
 *
 * `D03` dice que no hay formularios que escriban, y sigue siendo cierto: no hay base, no hay
 * servidor y nada sobrevive a cerrar la pestaña. Pero `HU-010` pide algo que **no se puede
 * demostrar sin estado**: que el turno que pide el paciente **aparezca en la agenda del
 * profesional**. Ese es justamente el argumento —«el turno entra solo, nadie lo copia a mano»— y
 * contarlo no alcanza: hay que pedir uno y después abrir la agenda y verlo ahí.
 *
 * Así que el pedido vive en `sessionStorage`, igual que la sesión simulada: **dura lo que dura la
 * demostración y se va con la pestaña**. No es una base de datos escondida ni el principio de
 * una; el día que haya backend, esto se borra y el pedido es un `POST`.
 *
 * La agenda lo muestra con su propio estado, «Pedido por el paciente», que se distingue de un
 * turno cargado por la secretaría. Si se mostrara igual, la demo estaría mintiendo sobre de
 * dónde salió.
 */

import { useCallback, useEffect, useState } from 'react';
import type { ProfesionalId } from '../datos/consultorio.ts';

export interface PedidoDeTurno {
  id: string;
  profesionalId: ProfesionalId;
  /** ISO, para que sobreviva a `JSON.stringify`. */
  inicio: string;
  indicePractica: number;
  /** Cuánto dura, según la especialidad del centro. */
  minutos: number;
  paciente: string;
  telefono: string;
  /** Si se reservó con seña, cuánto. Cero es sin seña. */
  sena: number;
}

const CLAVE = 'cuspide.pedidos';

/** Un evento propio: `storage` no se dispara en la misma pestaña que escribió. */
const EVENTO = 'cuspide:pedidos';

export function leerPedidos(): PedidoDeTurno[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    const datos: unknown = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(datos) ? (datos as PedidoDeTurno[]) : [];
  } catch {
    // Ventana privada, almacenamiento bloqueado o JSON roto: la demo sigue, sin pedidos.
    return [];
  }
}

function guardar(pedidos: PedidoDeTurno[]) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(pedidos));
  } catch {
    // Que no se pueda guardar no puede romper la pantalla: se pierde el pedido y nada más.
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function agregarPedido(pedido: Omit<PedidoDeTurno, 'id'>): PedidoDeTurno {
  const nuevo: PedidoDeTurno = { ...pedido, id: `pd${Date.now().toString(36)}` };
  guardar([...leerPedidos(), nuevo]);
  return nuevo;
}

export function borrarPedidos() {
  guardar([]);
}

/** Los pedidos, al día: cualquier pantalla que los muestre se entera cuando entra uno nuevo. */
export function usePedidos(): PedidoDeTurno[] {
  const [pedidos, setPedidos] = useState<PedidoDeTurno[]>(leerPedidos);

  const releer = useCallback(() => setPedidos(leerPedidos()), []);

  useEffect(() => {
    window.addEventListener(EVENTO, releer);
    window.addEventListener('storage', releer);
    return () => {
      window.removeEventListener(EVENTO, releer);
      window.removeEventListener('storage', releer);
    };
  }, [releer]);

  return pedidos;
}

/** Un pedido, con la forma que espera la agenda. */
export interface TurnoPedido {
  id: string;
  profesionalId: ProfesionalId;
  inicio: Date;
  minutos: number;
  indicePractica: number;
  estado: 'pedido';
  /** Quien lo pidió todavía no es un paciente del sistema: se muestra el nombre que escribió. */
  nombreLibre: string;
  telefono: string;
  sena: number;
}

export function comoTurnos(pedidos: PedidoDeTurno[]): TurnoPedido[] {
  return pedidos.map((p) => ({
    id: p.id,
    profesionalId: p.profesionalId,
    inicio: new Date(p.inicio),
    minutos: p.minutos,
    indicePractica: p.indicePractica,
    estado: 'pedido' as const,
    nombreLibre: p.paciente,
    telefono: p.telefono,
    sena: p.sena,
  }));
}
