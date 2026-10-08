/**
 * A quién le manda trabajo cada especialidad, y cómo se llama eso.
 *
 * **Es el módulo que más desnudaba la trampa de «genérico para cualquier consultorio».** Estaba
 * escrito entero en odontólogo —laboratorio de prótesis, coronas, ortodoncia, depósitos
 * dentales— y se veía igual en medicina y en kinesiología, que es donde la demo abre. Un médico
 * que entra a «Envíos al laboratorio» y lee «Puente de tres unidades — 24 a 26» cierra la
 * demostración ahí mismo.
 *
 * El ida y vuelta existe en las tres, pero **no es la misma cosa**:
 *
 * - el odontólogo manda una pieza física a un laboratorio de prótesis y la espera de vuelta;
 * - el clínico deriva un estudio a un centro de diagnóstico y espera un informe;
 * - el kinesiólogo manda equipamiento a reparar o calibrar, y es lo que menos usa.
 *
 * Por eso lo que cambia no son sólo las palabras: cambia **a quién** se le manda y **qué**. Si
 * esto fuera un diccionario de sinónimos sobre una lista única de proveedores, seguirían
 * apareciendo «Prótesis del Norte» en la pantalla de un kinesiólogo.
 */

import type { Palabra } from './tipos.ts';

export interface Proveedor {
  id: string;
  nombre: string;
  rubro: string;
  cuit: string;
  contacto: string;
  telefono: string;
  saldo: number;
}

export interface Derivaciones {
  /** Cómo se llama la pantalla en el menú. */
  menu: string;
  /** El título de la pantalla y su bajada. */
  titulo: string;
  bajada: string;
  /** A dónde va: «laboratorio», «centro de diagnóstico», «servicio técnico». */
  destino: Palabra;
  /** Qué se manda: «trabajo», «estudio», «equipo». */
  unidad: Palabra;
  /** La columna que dice qué se mandó. */
  trabajos: string[];
  /** Quién lo lleva y lo trae. En medicina no hay cadete: va el informe por sistema. */
  conCadete: boolean;
  /** El rubro de los proveedores que reciben estos envíos. */
  rubroPrincipal: string;
  proveedores: Proveedor[];
}

export const DERIVACIONES_ODONTOLOGIA: Derivaciones = {
  menu: 'Envíos al laboratorio',
  titulo: 'Envíos al laboratorio',
  bajada: 'Qué trabajo salió, con qué cadete, y cuándo tiene que volver. Lo demorado va primero.',
  destino: { singular: 'laboratorio', plural: 'laboratorios' },
  unidad: { singular: 'trabajo', plural: 'trabajos' },
  conCadete: true,
  rubroPrincipal: 'Laboratorio',
  trabajos: [
    'Prótesis removible superior',
    'Férula de descarga',
    'Puente de tres unidades — 24 a 26',
    'Reparación de prótesis',
    'Modelo de estudio',
    'Corona provisoria — pieza 36',
    'Placa de blanqueamiento',
    'Cubeta individual',
  ],
  proveedores: [
    {
      id: 'pr1',
      nombre: 'Laboratorio Dental Salta',
      rubro: 'Laboratorio',
      cuit: '30-71204558-3',
      contacto: 'Héctor Vilca',
      telefono: '387 4218890',
      saldo: 248_600,
    },
    {
      id: 'pr2',
      nombre: 'Prótesis del Norte',
      rubro: 'Laboratorio',
      cuit: '27-24887190-4',
      contacto: 'Silvia Arias',
      telefono: '387 4553012',
      saldo: 96_400,
    },
    {
      id: 'pr3',
      nombre: 'Depósito Dental Güemes',
      rubro: 'Depósito',
      cuit: '30-68554127-9',
      contacto: 'Mostrador',
      telefono: '387 4310077',
      saldo: 0,
    },
    {
      id: 'pr4',
      nombre: 'Insumos Odontológicos SRL',
      rubro: 'Depósito',
      cuit: '30-70998341-1',
      contacto: 'Ventas',
      telefono: '011 47882300',
      saldo: 412_300,
    },
    {
      id: 'pr5',
      nombre: 'Esterilización Central',
      rubro: 'Servicios',
      cuit: '30-71455208-6',
      contacto: 'Guardia',
      telefono: '387 4667712',
      saldo: 33_900,
    },
    {
      id: 'pr6',
      nombre: 'Radiología Belgrano',
      rubro: 'Servicios',
      cuit: '27-20114558-2',
      contacto: 'Turnos',
      telefono: '387 4229004',
      saldo: 0,
    },
  ],
};

export const DERIVACIONES_MEDICINA: Derivaciones = {
  menu: 'Estudios derivados',
  titulo: 'Estudios derivados',
  bajada:
    'Qué estudio se pidió, a dónde, y cuándo tendría que estar el informe. Lo demorado va primero.',
  destino: { singular: 'centro de diagnóstico', plural: 'centros de diagnóstico' },
  unidad: { singular: 'estudio', plural: 'estudios' },
  // El informe vuelve por sistema o por correo: no hay nadie llevando un sobre.
  conCadete: false,
  rubroPrincipal: 'Diagnóstico',
  trabajos: [
    'Laboratorio — hemograma y perfil lipídico',
    'Ecografía abdominal',
    'Radiografía de tórax, frente y perfil',
    'Electrocardiograma con informe',
    'Tomografía de cerebro sin contraste',
    'Espirometría',
    'Holter de 24 horas',
    'Ergometría',
  ],
  proveedores: [
    {
      id: 'pr1',
      nombre: 'Laboratorio Bioquímico del Norte',
      rubro: 'Diagnóstico',
      cuit: '30-71204558-3',
      contacto: 'Héctor Vilca',
      telefono: '387 4218890',
      saldo: 248_600,
    },
    {
      id: 'pr2',
      nombre: 'Centro de Imágenes Belgrano',
      rubro: 'Diagnóstico',
      cuit: '27-24887190-4',
      contacto: 'Silvia Arias',
      telefono: '387 4553012',
      saldo: 96_400,
    },
    {
      id: 'pr3',
      nombre: 'Droguería Güemes',
      rubro: 'Depósito',
      cuit: '30-68554127-9',
      contacto: 'Mostrador',
      telefono: '387 4310077',
      saldo: 0,
    },
    {
      id: 'pr4',
      nombre: 'Insumos Médicos SRL',
      rubro: 'Depósito',
      cuit: '30-70998341-1',
      contacto: 'Ventas',
      telefono: '011 47882300',
      saldo: 412_300,
    },
    {
      id: 'pr5',
      nombre: 'Esterilización Central',
      rubro: 'Servicios',
      cuit: '30-71455208-6',
      contacto: 'Guardia',
      telefono: '387 4667712',
      saldo: 33_900,
    },
    {
      id: 'pr6',
      nombre: 'Residuos Patogénicos SA',
      rubro: 'Servicios',
      cuit: '27-20114558-2',
      contacto: 'Logística',
      telefono: '387 4229004',
      saldo: 0,
    },
  ],
};

export const DERIVACIONES_KINESIOLOGIA: Derivaciones = {
  menu: 'Equipamiento y service',
  titulo: 'Equipamiento en service',
  bajada:
    'Qué equipo salió a reparar o calibrar, y cuándo tiene que volver. Lo demorado va primero.',
  destino: { singular: 'servicio técnico', plural: 'servicios técnicos' },
  unidad: { singular: 'equipo', plural: 'equipos' },
  conCadete: true,
  rubroPrincipal: 'Servicio técnico',
  trabajos: [
    'Equipo de ultrasonido — cabezal',
    'Magneto — calibración anual',
    'Electroestimulador de cuatro canales',
    'Camilla hidráulica — pistón',
    'Lámpara infrarroja',
    'Bicicleta ergométrica — freno',
    'Tens portátil',
    'Compresero — termostato',
  ],
  proveedores: [
    {
      id: 'pr1',
      nombre: 'Service Kinefis Salta',
      rubro: 'Servicio técnico',
      cuit: '30-71204558-3',
      contacto: 'Héctor Vilca',
      telefono: '387 4218890',
      saldo: 248_600,
    },
    {
      id: 'pr2',
      nombre: 'Electromedicina del Norte',
      rubro: 'Servicio técnico',
      cuit: '27-24887190-4',
      contacto: 'Silvia Arias',
      telefono: '387 4553012',
      saldo: 96_400,
    },
    {
      id: 'pr3',
      nombre: 'Insumos Kinésicos Güemes',
      rubro: 'Depósito',
      cuit: '30-68554127-9',
      contacto: 'Mostrador',
      telefono: '387 4310077',
      saldo: 0,
    },
    {
      id: 'pr4',
      nombre: 'Ortopedia Belgrano SRL',
      rubro: 'Depósito',
      cuit: '30-70998341-1',
      contacto: 'Ventas',
      telefono: '011 47882300',
      saldo: 412_300,
    },
    {
      id: 'pr5',
      nombre: 'Limpieza y Mantenimiento',
      rubro: 'Servicios',
      cuit: '30-71455208-6',
      contacto: 'Guardia',
      telefono: '387 4667712',
      saldo: 33_900,
    },
    {
      id: 'pr6',
      nombre: 'Calibraciones INTI',
      rubro: 'Servicios',
      cuit: '27-20114558-2',
      contacto: 'Turnos',
      telefono: '387 4229004',
      saldo: 0,
    },
  ],
};
