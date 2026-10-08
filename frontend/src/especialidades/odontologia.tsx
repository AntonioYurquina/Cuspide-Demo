import { Odontograma } from './fichas/Odontograma.tsx';
import { ConsentimientoInformado, PlanDeTratamiento } from './documentos/odontologia.tsx';
import { DERIVACIONES_ODONTOLOGIA } from './derivaciones.ts';
import { ArcadaDental } from './arte/ArcadaDental.tsx';
import type { Especialidad } from './tipos.ts';

export const ODONTOLOGIA: Especialidad = {
  clave: 'odontologia',
  nombre: 'Odontología',
  profesional: { singular: 'odontólogo', plural: 'odontólogos' },
  profesionalF: { singular: 'odontóloga', plural: 'odontólogas' },
  recurso: { singular: 'box', plural: 'boxes' },
  unidad: { singular: 'práctica', plural: 'prácticas' },
  enSeries: false,
  fichaClinica: 'Odontograma',
  Ficha: Odontograma,
  minutosPorTurno: 30,
  documentos: [
    { nombre: 'Consentimiento informado', Componente: ConsentimientoInformado },
    { nombre: 'Plan de tratamiento', Componente: PlanDeTratamiento },
  ],
  derivaciones: DERIVACIONES_ODONTOLOGIA,
  ArteLogin: ArcadaDental,
  productos: [
    {
      id: 'p1',
      nombre: 'Cepillo de cerdas suaves',
      detalle: 'Para uso diario, con mango antideslizante.',
      precio: 4_900,
      rubro: 'Higiene',
    },
    {
      id: 'p2',
      nombre: 'Kit de higiene completo',
      detalle: 'Cepillo, hilo, enjuague y pastillas reveladoras.',
      precio: 16_800,
      rubro: 'Higiene',
    },
    {
      id: 'p3',
      nombre: 'Férula de descanso nocturno',
      detalle: 'Termoformada a medida sobre impresión tomada en el centro.',
      precio: 78_000,
      rubro: 'A medida',
    },
    {
      id: 'p4',
      nombre: 'Irrigador bucal',
      detalle: 'Tres niveles de presión, con cuatro cabezales.',
      precio: 54_200,
      rubro: 'Higiene',
    },
    {
      id: 'p5',
      nombre: 'Protector bucal deportivo',
      detalle: 'Termoformado a medida. Para deportes de contacto.',
      precio: 38_500,
      rubro: 'A medida',
    },
    {
      id: 'p6',
      nombre: 'Pasta para dientes sensibles',
      detalle: 'Tubo de 90 g, con flúor.',
      precio: 7_200,
      rubro: 'Higiene',
    },
  ],
  practicas: [
    'Consulta y diagnóstico',
    'Limpieza y fluoración',
    'Restauración con composite',
    'Endodoncia — primera sesión',
    'Extracción simple',
    'Toma de impresión',
    'Prueba de corona',
    'Cementado de corona',
    'Control de ortodoncia',
    'Radiografía periapical',
  ],
};
