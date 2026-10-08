import type { ComponentType } from 'react';
import type { ClaveEspecialidad } from '@cuspide/shared';
import type { Paciente } from '../datos/consultorio.ts';
import type { Documento } from '../documentos/Visor.tsx';
import type { Derivaciones } from './derivaciones.ts';

/**
 * La forma de una especialidad.
 *
 * Es la decisión que gobierna el producto (ver el README): el **núcleo** —agenda, pacientes,
 * administración, sitio público, tienda— es idéntico para todos, y esto es **lo único** que
 * cambia entre un odontólogo, un médico y un kinesiólogo.
 *
 * Si algo de acá termina escrito en literal dentro de una pantalla del núcleo, el sistema dejó
 * de ser vendible a la especialidad siguiente. `vocabulario.test.ts` lo vigila.
 */

/** Una palabra con sus dos formas. El castellano las necesita casi siempre. */
export interface Palabra {
  singular: string;
  plural: string;
}

export interface ProductoDeTienda {
  id: string;
  nombre: string;
  detalle: string;
  precio: number;
  rubro: string;
}

export interface Especialidad {
  /** Identificador estable. No se muestra. */
  clave: ClaveEspecialidad;
  /** Cómo se llama la especialidad en pantalla. */
  nombre: string;
  /** Cómo se llama a quien atiende: odontólogo, médico, kinesiólogo. */
  profesional: Palabra;
  /**
   * El oficio en femenino.
   *
   * El castellano lo necesita y el producto lo usa donde hay una persona concreta: «Kinesióloga
   * Lucía Sandoval», no «Kinesiólogo». La forma masculina sigue sirviendo para lo genérico
   * —«Elegí al profesional»— donde no hay nadie en particular.
   */
  profesionalF: Palabra;
  /**
   * Dónde ocurre la atención: box, consultorio, camilla.
   *
   * No es un detalle de vocabulario: es lo que el turno **ocupa**, y es el primer lugar donde un
   * kinesiólogo se da cuenta de que el sistema es de otro.
   */
  recurso: Palabra;
  /**
   * Qué se agenda y qué se cobra: práctica, consulta, sesión.
   *
   * Un kinesiólogo no vende consultas sueltas: vende **series de sesiones autorizadas**, y de
   * ahí sale `enSeries`.
   */
  unidad: Palabra;
  /** `true` cuando la unidad se vende de a series —kinesiología—, no de a una. */
  enSeries: boolean;
  /** Cómo se llama el registro clínico: odontograma, historia clínica, ficha kinésica. */
  /** Cómo se llama la ficha clínica de esta especialidad, para decirlo en pantalla. */
  fichaClinica: string;
  /**
   * La ficha clínica en sí.
   *
   * **Es lo que hace que el sistema sea el del odontólogo y no el de otro.** El núcleo no sabe
   * qué dibuja: `PaginaPacientes` pone `<e.Ficha paciente={p} />` y se termina. Agregar una
   * especialidad nueva es agregar un archivo acá, no tocar una pantalla.
   */
  Ficha: ComponentType<{ paciente: Paciente }>;
  /** Duración por omisión de un turno, en minutos. */
  minutosPorTurno: number;
  /** Los documentos que esta especialidad imprime, además de los comunes a todas. */
  /**
   * Los papeles propios de esta especialidad, con el componente que los dibuja.
   *
   * Eran nombres sueltos y ahora son documentos de verdad: un nombre que no se puede imprimir es
   * una promesa en una lista. Los comunes —constancia, presupuesto, ficha, comprobante— no están
   * acá porque no cambian entre especialidades.
   */
  documentos: Documento[];
  /**
   * A quién le manda trabajo esta especialidad, y cómo se llama eso.
   *
   * No son sólo palabras: cambian **a quién** se le manda y **qué**. Un kinesiólogo no tiene
   * laboratorio de prótesis, tiene servicio técnico; un clínico no manda una pieza, deriva un
   * estudio y espera un informe. Esto estaba escrito en odontólogo y se veía igual en las tres.
   */
  derivaciones: Derivaciones;
  /**
   * El fondo del panel de marca del login.
   *
   * Dibuja lo que el sistema administra. Antes era siempre un odontograma: un kinesiólogo
   * entraba al sistema que le vendían como suyo y lo recibía una boca.
   */
  ArteLogin: ComponentType;
  /**
   * Lo que el centro vende además de atender.
   *
   * Los bonos son del núcleo —son unidades de atención prepagas y existen en las tres—, pero
   * los productos no: una férula de descarga no la vende un kinesiólogo y una faja lumbar no la
   * vende un odontólogo.
   */
  productos: ProductoDeTienda[];
  /** Ejemplos de prácticas, para sembrar la demo con algo creíble. */
  practicas: string[];
}

/**
 * Las claves vienen de `@cuspide/shared`, no se declaran acá.
 *
 * Estaban escritas dos veces —una lista literal en el frontend y otra en `shared`— que es
 * exactamente lo que el paquete compartido existe para evitar: el día que entre una cuarta
 * vertical, una de las dos se queda vieja y el backend acepta un valor que la pantalla no sabe
 * dibujar.
 */
export type { ClaveEspecialidad };
