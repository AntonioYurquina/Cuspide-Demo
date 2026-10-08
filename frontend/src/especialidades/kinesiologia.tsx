import { FichaKinesica } from './fichas/FichaKinesica.tsx';
import {
  AltaKinesiologica,
  InformeDeEvolucion,
  PlanDeSesiones,
} from './documentos/kinesiologia.tsx';
import { DERIVACIONES_KINESIOLOGIA } from './derivaciones.ts';
import { Movimiento } from './arte/Movimiento.tsx';
import type { Especialidad } from './tipos.ts';

/**
 * La especialidad que más se diferencia de las otras dos, y por eso la que prueba que el
 * vocabulario aguanta: acá no se atienden consultas sueltas sino **series de sesiones
 * autorizadas**, y lo que se lleva es la evolución entre una y otra.
 */
export const KINESIOLOGIA: Especialidad = {
  clave: 'kinesiologia',
  nombre: 'Kinesiología',
  profesional: { singular: 'kinesiólogo', plural: 'kinesiólogos' },
  profesionalF: { singular: 'kinesióloga', plural: 'kinesiólogas' },
  recurso: { singular: 'camilla', plural: 'camillas' },
  unidad: { singular: 'sesión', plural: 'sesiones' },
  enSeries: true,
  fichaClinica: 'Ficha kinésica',
  Ficha: FichaKinesica,
  minutosPorTurno: 45,
  documentos: [
    { nombre: 'Plan de sesiones', Componente: PlanDeSesiones },
    { nombre: 'Informe de evolución', Componente: InformeDeEvolucion },
    { nombre: 'Alta kinesiológica', Componente: AltaKinesiologica },
  ],
  derivaciones: DERIVACIONES_KINESIOLOGIA,
  ArteLogin: Movimiento,
  productos: [
    {
      id: 'p1',
      nombre: 'Banda elástica de ejercicio',
      detalle: 'Resistencia media, dos metros. Para trabajo domiciliario.',
      precio: 9_400,
      rubro: 'Ejercicio',
    },
    {
      id: 'p2',
      nombre: 'Faja lumbar regulable',
      detalle: 'Talles S a XL. Sostén sin restringir el movimiento.',
      precio: 42_500,
      rubro: 'Ortopedia',
    },
    {
      id: 'p3',
      nombre: 'Rodillo de liberación miofascial',
      detalle: 'Densidad media, 33 cm.',
      precio: 23_700,
      rubro: 'Ejercicio',
    },
    {
      id: 'p4',
      nombre: 'Compresa de gel frío-calor',
      detalle: 'Reutilizable, con funda de tela.',
      precio: 11_300,
      rubro: 'Cuidado',
    },
    {
      id: 'p5',
      nombre: 'Tobillera elástica con refuerzo',
      detalle: 'Para esguinces en etapa de carga.',
      precio: 26_900,
      rubro: 'Ortopedia',
    },
    {
      id: 'p6',
      nombre: 'Pelota de rehabilitación',
      detalle: '65 cm, con inflador. Para trabajo de core y equilibrio.',
      precio: 19_800,
      rubro: 'Ejercicio',
    },
  ],
  practicas: [
    'Evaluación inicial',
    'Kinesioterapia motora',
    'Magnetoterapia',
    'Ultrasonido',
    'Electroanalgesia',
    'Reeducación postural',
    'Drenaje linfático',
    'Rehabilitación post quirúrgica',
    'Terapia manual',
    'Control de evolución',
  ],
};
