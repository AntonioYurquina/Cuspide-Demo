/**
 * Los usuarios de la demo.
 *
 * Las contraseñas están en texto plano **a propósito y sin consecuencia**: no hay datos reales
 * detrás y el sistema no tiene backend. En la etapa dos esto desaparece entero y las
 * credenciales pasan a la base, hasheadas con Argon2id.
 *
 * Son tres porque son los tres roles, y el sentido de la demo es poder cambiar de uno a otro
 * delante del cliente y mostrarle que el menú cambia.
 */

import type { ClaveRol } from '../permisos.ts';

export interface UsuarioDemo {
  usuario: string;
  contrasena: string;
  nombreCompleto: string;
  rol: ClaveRol;
}

export const USUARIOS: UsuarioDemo[] = [
  {
    usuario: 'admin',
    contrasena: 'demo',
    nombreCompleto: 'Dra. Carolina Ferreyra',
    rol: 'administrador',
  },
  { usuario: 'secretaria', contrasena: 'demo', nombreCompleto: 'Mariana Ojeda', rol: 'secretaria' },
  {
    usuario: 'profesional',
    contrasena: 'demo',
    nombreCompleto: 'Dr. Ignacio Paz',
    rol: 'profesional',
  },
];
