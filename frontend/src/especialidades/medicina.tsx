import { HistoriaClinica } from './fichas/HistoriaClinica.tsx';
import { CertificadoMedico, OrdenDeEstudio, Receta } from './documentos/medicina.tsx';
import { DERIVACIONES_MEDICINA } from './derivaciones.ts';
import { Pulso } from './arte/Pulso.tsx';
import type { Especialidad } from './tipos.ts';

export const MEDICINA: Especialidad = {
  clave: 'medicina',
  nombre: 'Medicina general',
  profesional: { singular: 'médico', plural: 'médicos' },
  profesionalF: { singular: 'médica', plural: 'médicas' },
  recurso: { singular: 'consultorio', plural: 'consultorios' },
  unidad: { singular: 'consulta', plural: 'consultas' },
  enSeries: false,
  fichaClinica: 'Historia clínica',
  Ficha: HistoriaClinica,
  minutosPorTurno: 20,
  documentos: [
    { nombre: 'Receta', Componente: Receta },
    { nombre: 'Orden de estudio', Componente: OrdenDeEstudio },
    { nombre: 'Certificado médico', Componente: CertificadoMedico },
  ],
  derivaciones: DERIVACIONES_MEDICINA,
  ArteLogin: Pulso,
  productos: [
    {
      id: 'p1',
      nombre: 'Tensiómetro digital de brazo',
      detalle: 'Con memoria para dos personas y detección de arritmia.',
      precio: 62_400,
      rubro: 'Control',
    },
    {
      id: 'p2',
      nombre: 'Oxímetro de pulso',
      detalle: 'Saturación y frecuencia, con pantalla orientable.',
      precio: 21_800,
      rubro: 'Control',
    },
    {
      id: 'p3',
      nombre: 'Termómetro infrarrojo',
      detalle: 'Sin contacto, lectura en un segundo.',
      precio: 18_600,
      rubro: 'Control',
    },
    {
      id: 'p4',
      nombre: 'Pastillero semanal',
      detalle: 'Cuatro tomas por día, con tapa a presión.',
      precio: 6_900,
      rubro: 'Cuidado',
    },
    {
      id: 'p5',
      nombre: 'Medias de compresión graduada',
      detalle: 'Talles S a XL. Para viajes largos y várices.',
      precio: 29_500,
      rubro: 'Cuidado',
    },
    {
      id: 'p6',
      nombre: 'Nebulizador de compresor',
      detalle: 'Con máscara adulta y pediátrica.',
      precio: 74_300,
      rubro: 'Cuidado',
    },
  ],
  practicas: [
    'Consulta clínica',
    'Control periódico',
    'Certificado de aptitud',
    'Control de presión',
    'Electrocardiograma',
    'Consulta por guardia',
    'Seguimiento de crónico',
    'Vacunación',
    'Curación',
    'Interconsulta',
  ],
};
