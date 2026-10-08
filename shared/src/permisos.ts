/**
 * Catálogo de permisos y roles.
 *
 * **Esto es de verdad, aunque la etapa sea demostrativa.** Es el ancla de credibilidad de la
 * demo: cuando el odontólogo pregunte «¿y la secretaria puede ver la facturación?», se cambia
 * de usuario delante de él y se le muestra que no.
 *
 * El permiso se nombra `entidad.accion`: se lee solo y ordena el catálogo
 * sin necesidad de agrupar a mano.
 *
 * > **Lo que en la etapa dos cambia.** Acá el permiso decide **qué se dibuja**. Con backend, el
 * > servidor decide **qué se puede hacer**, y esto pasa a ser cortesía visual: ocultar lo que no
 * > se puede usar. Nunca al revés — un permiso que sólo vive en el navegador no protege nada.
 */

export const PERMISOS = {
  AGENDA_VER: 'agenda.ver',
  TURNOS_VER: 'turnos.ver',
  TURNOS_CREAR: 'turnos.crear',
  PACIENTES_VER: 'pacientes.ver',
  PACIENTES_EDITAR: 'pacientes.editar',
  LABORATORIO_VER: 'laboratorio.ver',
  LABORATORIO_DESPACHAR: 'laboratorio.despachar',
  PROVEEDORES_VER: 'proveedores.ver',
  FACTURACION_VER: 'facturacion.ver',
  FACTURACION_EMITIR: 'facturacion.emitir',
  CONTABILIDAD_VER: 'contabilidad.ver',
  USUARIOS_VER: 'usuarios.ver',
  USUARIOS_EDITAR: 'usuarios.editar',
  CONFIGURACION_VER: 'configuracion.ver',
} as const;

export type CodigoPermiso = (typeof PERMISOS)[keyof typeof PERMISOS];

/** Para qué sirve cada permiso, en la pantalla de usuarios. */
export const ETIQUETA_PERMISO: Record<CodigoPermiso, string> = {
  [PERMISOS.AGENDA_VER]: 'Ver la agenda del día',
  [PERMISOS.TURNOS_VER]: 'Ver los turnos',
  [PERMISOS.TURNOS_CREAR]: 'Dar y mover turnos',
  [PERMISOS.PACIENTES_VER]: 'Ver pacientes',
  [PERMISOS.PACIENTES_EDITAR]: 'Editar la ficha del paciente',
  [PERMISOS.LABORATORIO_VER]: 'Ver los envíos al laboratorio',
  [PERMISOS.LABORATORIO_DESPACHAR]: 'Despachar y recibir trabajos',
  [PERMISOS.PROVEEDORES_VER]: 'Ver proveedores',
  [PERMISOS.FACTURACION_VER]: 'Ver comprobantes',
  [PERMISOS.FACTURACION_EMITIR]: 'Emitir comprobantes',
  [PERMISOS.CONTABILIDAD_VER]: 'Ver contabilidad y libro IVA',
  [PERMISOS.USUARIOS_VER]: 'Ver usuarios y roles',
  [PERMISOS.USUARIOS_EDITAR]: 'Crear y editar usuarios',
  [PERMISOS.CONFIGURACION_VER]: 'Ver la configuración',
};

const TODOS = Object.values(PERMISOS);

/**
 * Los tres roles que un consultorio chico necesita de entrada. No son una suposición sobre este
 * cliente en particular: son el mínimo que separa **quién atiende el mostrador**, **quién
 * atiende al paciente** y **quién mira la plata**.
 */
export const ROLES = {
  administrador: {
    nombre: 'Administrador',
    descripcion: 'Todo el sistema, incluidos usuarios y configuración.',
    permisos: TODOS,
  },
  secretaria: {
    nombre: 'Secretaría',
    descripcion: 'El mostrador: agenda, turnos, pacientes y el ida y vuelta con el laboratorio.',
    permisos: [
      PERMISOS.AGENDA_VER,
      PERMISOS.TURNOS_VER,
      PERMISOS.TURNOS_CREAR,
      PERMISOS.PACIENTES_VER,
      PERMISOS.PACIENTES_EDITAR,
      PERMISOS.LABORATORIO_VER,
      PERMISOS.LABORATORIO_DESPACHAR,
      PERMISOS.PROVEEDORES_VER,
    ] as CodigoPermiso[],
  },
  profesional: {
    nombre: 'Profesional',
    descripcion: 'Su agenda y las fichas de sus pacientes. No ve facturación ni contabilidad.',
    permisos: [
      PERMISOS.AGENDA_VER,
      PERMISOS.TURNOS_VER,
      PERMISOS.PACIENTES_VER,
      PERMISOS.PACIENTES_EDITAR,
      PERMISOS.LABORATORIO_VER,
    ] as CodigoPermiso[],
  },
} as const;

export type ClaveRol = keyof typeof ROLES;

/** Cortesía visual: oculta lo que el usuario no puede hacer. */
export function tienePermiso(
  permisos: readonly CodigoPermiso[] | undefined,
  permiso: CodigoPermiso,
): boolean {
  return permisos?.includes(permiso) ?? false;
}
