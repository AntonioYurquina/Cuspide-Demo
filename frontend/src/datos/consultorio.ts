/**
 * Los datos del consultorio de la demo.
 *
 * **Verosímiles a propósito.** Nombres argentinos reales, obras sociales que existen, prácticas
 * con su nomenclatura y precios de este año. Una demo con `Paciente 1` y `$1000` se nota, y lo
 * que se nota es que no lo usó nadie.
 *
 * Todo se deriva de `HOY`, así que la agenda siempre cae en la semana en curso: una demo con
 * turnos del mes pasado se ve abandonada.
 */

/**
 * Mezcla entera, para que dos cosas vecinas no compartan destino.
 *
 * **Toda la siembra pasa por acá, y no es paranoia.** Las cuentas lineales del tipo
 * `semilla * 13 + i * 7` parecen aleatorias y no lo son: se sincronizan con los módulos que
 * después deciden qué práctica, qué estado o qué diagnóstico toca. Pasó dos veces en este
 * proyecto, y la segunda fue cara: `pacienteId` salía de `PACIENTES[(n*13) % 40]` y la práctica
 * de `n % 10`, y como 40 es múltiplo de 10 **cada paciente repetía exactamente la misma práctica
 * en todos sus turnos, siempre**. Un historial clínico de ocho «Control de presión» seguidos es
 * lo primero que un médico ve.
 */
export function mezclar(x: number): number {
  let n = x | 0;
  n = (n ^ (n >>> 15)) * 0x2c1b3c6d;
  n = (n ^ (n >>> 12)) * 0x297a2d39;
  return Math.abs(n ^ (n >>> 15));
}

export const HOY = new Date();

/** Fecha con los días corridos que se le pidan, a medianoche. */
export function dia(offset: number): Date {
  const d = new Date(HOY);
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function conHora(offset: number, hora: number, minutos = 0): Date {
  const d = dia(offset);
  d.setHours(hora, minutos, 0, 0);
  return d;
}

/**
 * Quienes atienden.
 *
 * **Llevan género**, y no es un detalle de corrección: el sitio público llamaba «Kinesiólogo» y
 * «Médico» a las dos profesionales mujeres, en la pantalla que ve el paciente. El nombre de
 * oficio lo pone la vertical, que trae las dos formas.
 */
export const PROFESIONALES = [
  { id: 'p1', nombre: 'Carolina Ferreyra', matricula: 'MP 8412', color: 'marca', genero: 'f' },
  { id: 'p2', nombre: 'Ignacio Paz', matricula: 'MP 9037', color: 'tinta', genero: 'm' },
  { id: 'p3', nombre: 'Lucía Sandoval', matricula: 'MP 7725', color: 'purpura', genero: 'f' },
] as const;

/** Cómo se trata a quien atiende: «Dra.» o «Dr.». */
export function trato(id: ProfesionalId): string {
  return profesionalDe(id).genero === 'f' ? 'Dra.' : 'Dr.';
}

export type ProfesionalId = (typeof PROFESIONALES)[number]['id'];

/**
 * Dónde ocurre la atención. Se numeran y no se nombran: cómo se llaman —box, consultorio,
 * camilla— lo dice la especialidad, y el número es lo único que no cambia.
 */
export const RECURSOS = [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }, { id: 'r4' }] as const;

export const OBRAS_SOCIALES = [
  'Particular',
  'OSDE',
  'Swiss Medical',
  'IAPOS',
  'PAMI',
  'Galeno',
  'OSPe',
] as const;

export const ESTADOS_TURNO = {
  confirmado: { etiqueta: 'Confirmado', tono: 'tinta' },
  enSala: { etiqueta: 'En sala', tono: 'ambar' },
  atendido: { etiqueta: 'Atendido', tono: 'marca' },
  ausente: { etiqueta: 'Ausente', tono: 'rojo' },
  aConfirmar: { etiqueta: 'A confirmar', tono: 'gris' },
  /**
   * Lo pidió el paciente desde el sitio y todavía nadie lo confirmó.
   *
   * Se distingue de `aConfirmar` a propósito: uno lo cargó la secretaría y falta que el paciente
   * confirme; este entró solo y falta que lo mire alguien del centro. Mostrarlos iguales sería
   * mentir sobre de dónde salió, que es justo lo que el producto vende.
   */
  pedido: { etiqueta: 'Pedido por el paciente', tono: 'purpura' },
} as const;

export type EstadoTurno = keyof typeof ESTADOS_TURNO;

export interface Paciente {
  id: string;
  apellido: string;
  nombre: string;
  documento: string;
  telefono: string;
  obraSocial: (typeof OBRAS_SOCIALES)[number];
  afiliado: string;
  /**
   * La última vez que vino, **derivada de los turnos atendidos** con `ultimaVisitaDe`.
   *
   * Era un campo sembrado aparte —`dia(-(i * 11 + 3))`— que no miraba la agenda, así que la
   * ficha del paciente decía «última visita 27/09» arriba y listaba abajo una atención del 09/10
   * en la misma hoja impresa. Dos datos que describen lo mismo y se calculan por separado se
   * contradicen siempre: es cuestión de tiempo.
   */
  ultimaVisita: Date;
  deuda: number;
  /**
   * Hace falta para la ficha clínica y **no es un dato de adorno**: en odontología decide si se
   * dibuja la dentición temporaria o la permanente, y en medicina general decide los rangos de
   * los signos vitales. Un dato del núcleo que cada vertical lee a su manera.
   */
  nacimiento: Date;
}

/** Años cumplidos a hoy. */
export function edad(p: Paciente): number {
  let años = HOY.getFullYear() - p.nacimiento.getFullYear();
  const mes = HOY.getMonth() - p.nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && HOY.getDate() < p.nacimiento.getDate())) años--;
  return años;
}

/** Cuarenta pacientes con apellidos frecuentes en la Argentina. */
const APELLIDOS = [
  'Gómez',
  'Rodríguez',
  'Fernández',
  'López',
  'Martínez',
  'Pérez',
  'Álvarez',
  'Sosa',
  'Romero',
  'Torres',
  'Ruiz',
  'Ramírez',
  'Flores',
  'Benítez',
  'Acosta',
  'Medina',
  'Herrera',
  'Aguirre',
  'Pereyra',
  'Gutiérrez',
  'Molina',
  'Castro',
  'Ortiz',
  'Silva',
  'Núñez',
  'Luna',
  'Juárez',
  'Cabrera',
  'Ríos',
  'Morales',
  'Godoy',
  'Vega',
  'Ledesma',
  'Maldonado',
  'Correa',
  'Peralta',
  'Villalba',
  'Ávila',
  'Ibáñez',
  'Quiroga',
];
const NOMBRES = [
  'María',
  'Juan',
  'Ana',
  'Carlos',
  'Lucía',
  'Diego',
  'Valentina',
  'Martín',
  'Sofía',
  'Pablo',
  'Camila',
  'Nicolás',
  'Julieta',
  'Federico',
  'Florencia',
  'Gonzalo',
  'Agustina',
  'Matías',
  'Micaela',
  'Santiago',
];

export const PACIENTES: Paciente[] = APELLIDOS.map((apellido, i) => ({
  id: `pa${i + 1}`,
  apellido,
  nombre: NOMBRES[i % NOMBRES.length]!,
  documento: String(18_000_000 + i * 743_219).slice(0, 8),
  telefono: `387 ${String(4_000_000 + i * 31_457).slice(0, 7)}`,
  obraSocial: OBRAS_SOCIALES[i % OBRAS_SOCIALES.length]!,
  afiliado: `${String(100_000 + i * 1_237)}/0${(i % 4) + 1}`,
  ultimaVisita: dia(-(i * 11 + 3)), // se recalcula abajo, cuando existen los turnos
  deuda: i % 7 === 0 ? (i % 3) * 14_500 + 9_800 : 0,
  // Entre 4 y 81 años, con menores cada cinco: sin chicos en la lista, la dentición temporaria
  // del odontograma no se ve nunca y la mitad de esa ficha queda sin demostrar. El desfasaje
  // del `=== 3` no es casual: **el primero de la lista tiene que ser adulto**, porque es el que
  // se abre en la demo, y una nena de cuatro años con lumbalgia de tres semanas se lee como
  // datos inventados aunque el resto esté bien.
  nacimiento: new Date(
    HOY.getFullYear() - (i % 5 === 3 ? 4 + (i % 3) * 4 : 19 + ((i * 7) % 63)),
    (i * 5) % 12,
    ((i * 13) % 27) + 1,
  ),
}));

export interface Turno {
  id: string;
  pacienteId: string;
  profesionalId: ProfesionalId;
  recursoId: string;
  inicio: Date;
  minutos: number;
  /** Índice en `especialidad.practicas`: qué se hace lo dice la vertical. */
  indicePractica: number;
  /**
   * En qué punto de un tratamiento largo cae este turno.
   *
   * El dato existe siempre; **quién lo muestra lo decide la vertical** (`especialidad.enSeries`).
   * Kinesiología trabaja por series —«sesión 4 de 10»— y esa es una diferencia de negocio, no de
   * vocabulario: cambia qué se autoriza, qué se factura y cuándo se da el alta. En odontología y
   * en medicina general el turno se agota en sí mismo y el número no se dibuja.
   */
  serie: { numero: number; total: number };
  estado: EstadoTurno;
}

/** Agenda de tres semanas: la anterior cerrada, ésta en curso, la que viene abierta. */
function generarTurnos(): Turno[] {
  const turnos: Turno[] = [];
  let n = 0;

  for (let offset = -7; offset <= 10; offset++) {
    const fecha = dia(offset);
    // Domingo cerrado; sábado sólo a la mañana.
    const diaSemana = fecha.getDay();
    if (diaSemana === 0) continue;
    const franjas = diaSemana === 6 ? [9, 10, 11] : [9, 10, 11, 12, 15, 16, 17, 18];

    for (const hora of franjas) {
      for (const prof of PROFESIONALES) {
        // No todas las franjas de todos los profesionales están tomadas: una agenda llena
        // al 100 % no existe, y una demo que la muestra se lee como inventada.
        if ((n * 7 + hora + prof.id.charCodeAt(1)) % 3 === 0) {
          n++;
          continue;
        }
        const paciente = PACIENTES[mezclar(n * 977 + 41) % PACIENTES.length]!;
        const estado: EstadoTurno =
          offset < 0
            ? n % 9 === 0
              ? 'ausente'
              : 'atendido'
            : offset > 0
              ? n % 5 === 0
                ? 'aConfirmar'
                : 'confirmado'
              : hora < HOY.getHours()
                ? 'atendido'
                : hora === HOY.getHours()
                  ? 'enSala'
                  : 'confirmado';

        turnos.push({
          id: `t${n}`,
          pacienteId: paciente.id,
          profesionalId: prof.id,
          recursoId: RECURSOS[n % 3]!.id,
          inicio: conHora(offset, hora, (n % 2) * 30),
          minutos: n % 4 === 0 ? 60 : 30,
          indicePractica: mezclar(n * 613 + 7) % 10,
          serie: {
            numero: (mezclar(n * 331 + 19) % 8) + 1,
            total: [8, 10, 12, 15][mezclar(n * 97) % 4]!,
          },
          estado,
        });
        n++;
      }
    }
  }
  return turnos;
}

export const TURNOS: Turno[] = generarTurnos();

/**
 * Las atenciones de un paciente, de la más reciente a la más vieja.
 *
 * **Sólo las atendidas y sólo las pasadas.** El historial listaba también los turnos futuros
 * —un «historial» con fechas que todavía no pasaron— y encima contradecía la última visita de
 * la fila de al lado.
 */
export function atencionesDe(pacienteId: string): Turno[] {
  return TURNOS.filter(
    (t) => t.pacienteId === pacienteId && t.estado === 'atendido' && t.inicio <= HOY,
  ).sort((a, b) => b.inicio.getTime() - a.inicio.getTime());
}

// La última visita sale de la agenda, no de una cuenta aparte. Se asigna acá porque los turnos
// se generan a partir de los pacientes y no pueden existir antes que ellos.
for (const p of PACIENTES) {
  const ultima = atencionesDe(p.id)[0];
  if (ultima) p.ultimaVisita = ultima.inicio;
}

export const ESTADOS_ENVIO = {
  preparado: { etiqueta: 'Preparado', tono: 'gris' },
  enCamino: { etiqueta: 'En camino', tono: 'ambar' },
  enLaboratorio: { etiqueta: 'En laboratorio', tono: 'tinta' },
  devuelto: { etiqueta: 'Devuelto', tono: 'marca' },
  demorado: { etiqueta: 'Demorado', tono: 'rojo' },
} as const;

export type EstadoEnvio = keyof typeof ESTADOS_ENVIO;

export interface Envio {
  id: string;
  pacienteId: string;
  /** Índice en `especialidad.derivaciones.proveedores`: a quién se le mandó lo dice la vertical. */
  indiceProveedor: number;
  /** Índice en `especialidad.derivaciones.trabajos`: qué se mandó también lo dice la vertical. */
  indiceTrabajo: number;
  cadete: string;
  salida: Date;
  regreso: Date;
  estado: EstadoEnvio;
}

const CADETES = ['Rubén Ávalos', 'Damián Ruiz', 'Nahuel Ponce'];

/**
 * Ocho envíos en curso. **Qué se mandó y a quién lo dice la vertical**: acá sólo viajan los
 * índices, porque un envío a un laboratorio de prótesis y uno a un centro de diagnóstico son la
 * misma fila con distinto contenido.
 */
export const ENVIOS: Envio[] = Array.from({ length: 8 }, (_, i) => {
  const salida = dia(-(i * 2 + 1));
  const regreso = dia(-(i * 2 + 1) + 7);
  const estado: EstadoEnvio =
    i === 0
      ? 'preparado'
      : i === 1
        ? 'enCamino'
        : i === 5
          ? 'demorado'
          : i >= 6
            ? 'devuelto'
            : 'enLaboratorio';
  return {
    id: `e${i + 1}`,
    pacienteId: PACIENTES[(i * 7 + 3) % PACIENTES.length]!.id,
    indiceProveedor: i % 2,
    indiceTrabajo: i,
    cadete: CADETES[i % CADETES.length]!,
    salida,
    regreso,
    estado,
  };
});

export const TIPOS_COMPROBANTE = [
  'Factura A',
  'Factura B',
  'Factura C',
  'Nota de crédito B',
] as const;

export interface Comprobante {
  id: string;
  tipo: (typeof TIPOS_COMPROBANTE)[number];
  numero: string;
  fecha: Date;
  /** Null si es emitido a un paciente; el índice del proveedor si es recibido. */
  indiceProveedor: number | null;
  razonSocial: string;
  /** El identificador fiscal. Un paciente se factura con DNI; un proveedor, con CUIT. */
  identificacion: string;
  neto: number;
  iva: number;
  total: number;
  sentido: 'emitido' | 'recibido';
}

export const COMPROBANTES: Comprobante[] = Array.from({ length: 28 }, (_, i) => {
  const emitido = i % 3 !== 0;
  const neto = emitido ? 18_000 + ((i * 7_300) % 240_000) : 24_000 + ((i * 11_900) % 380_000);
  const iva = Math.round(neto * 0.21);
  // El comprobante recibido es de un proveedor, y **quiénes son los proveedores lo dice la
  // vertical**. Acá viaja el índice y el nombre lo pone quien dibuja.
  const paciente = emitido ? PACIENTES[(i * 3) % PACIENTES.length]! : null;
  return {
    id: `c${i + 1}`,
    tipo: TIPOS_COMPROBANTE[i % 4]!,
    numero: `0003-${String(1840 + i).padStart(8, '0')}`,
    fecha: dia(-(i * 2)),
    indiceProveedor: paciente ? null : i % 6,
    // El nombre del proveedor lo pone quien dibuja, con su vertical a mano.
    razonSocial: paciente ? `${paciente.apellido}, ${paciente.nombre}` : '',
    // **DNI y no un CUIT inventado.** La versión anterior armaba `20-<dni>-4` para todos: el
    // prefijo 20 es el masculino y el dígito verificador salía siempre 4, así que cuarenta
    // pacientes tenían un CUIT que no pasa el módulo 11. Un contador lo ve de un vistazo.
    identificacion: paciente ? `DNI ${paciente.documento}` : '',
    neto,
    iva,
    total: neto + iva,
    sentido: emitido ? 'emitido' : 'recibido',
  };
});

/** Pesos con el formato argentino: `$ 1.234.567,89`. */
export function pesos(n: number): string {
  // Espacio **duro** entre el signo y la cifra: con el espacio común, un total de seis dígitos
  // se partía en dos renglones en los documentos impresos —el «$» arriba y el número abajo—.
  return `$\u00a0${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Cuánto vale cada práctica del nomenclador, por su índice.
 *
 * **Una sola tabla para todo el producto.** El presupuesto y el comprobante tenían cada uno su
 * cuenta, así que la misma práctica del mismo paciente salía con un precio en un papel y otro en
 * el de al lado, emitidos el mismo día. Es de las cosas que miran primero.
 */
const PRECIOS = [18_500, 24_000, 31_500, 42_000, 56_000, 9_800, 14_200, 68_000, 12_500, 7_900];

export function precioDe(indicePractica: number): number {
  return PRECIOS[indicePractica % PRECIOS.length]!;
}

/**
 * La hora, de 00 a 23, en todo el producto.
 *
 * `toLocaleTimeString` con la configuración argentina devolvía «03:30 p. m.» en el panel
 * mientras el sitio público mostraba «15:30»: el mismo turno con dos caras en el mismo producto.
 * En una agenda de trabajo el formato de 24 horas además se lee más rápido y no se confunde.
 */
export function hora(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function fechaCorta(d: Date): string {
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

/** «miércoles, 30 de septiembre». Para la pantalla, donde el día de la semana orienta. */
export function fechaLarga(d: Date): string {
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * «30 de septiembre de 2026». Para el papel.
 *
 * Un documento no lleva el día de la semana —«Salta, miércoles 30 de septiembre» no es como se
 * fecha nada— y sí lleva el año, que en la pantalla sobra y en un papel archivado no.
 */
export function fechaDeDocumento(d: Date): string {
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function pacienteDe(id: string): Paciente {
  return PACIENTES.find((p) => p.id === id)!;
}

export function profesionalDe(id: string) {
  return PROFESIONALES.find((p) => p.id === id)!;
}

export function mismoDia(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}
