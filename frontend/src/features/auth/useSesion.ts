/**
 * Sesión del cliente — **simulada**, porque esta etapa no tiene backend.
 *
 * Es la única pieza del sistema que miente a propósito, así que conviene que quede claro dónde
 * está la mentira y qué cambia cuando deje de serlo:
 *
 * - **Hoy:** el usuario se valida contra una lista en `datos/usuarios.ts` y la sesión se guarda
 *   en `sessionStorage`. Cualquiera que abra la consola puede darse permisos. **No protege
 *   nada**, y no tiene por qué: no hay datos reales detrás.
 * - **En la etapa dos:** se reemplaza el cuerpo de estas tres funciones por las llamadas a
 *   `/api/auth/*` y la sesión pasa a vivir en una cookie
 *   `httpOnly` contra una sesión persistida en base. **La forma de estas funciones no cambia**,
 *   así que ninguna pantalla se entera.
 *
 * Por eso vive detrás de `useSesion`/`useLogin`/`useLogout` y no suelta por ahí: el día del
 * cambio se toca un archivo.
 */

import { useCallback, useEffect, useState } from 'react';
import { ROLES, type ClaveRol, type CodigoPermiso } from '../../permisos.ts';
import { USUARIOS } from '../../datos/usuarios.ts';

export interface UsuarioDeSesion {
  usuario: string;
  nombreCompleto: string;
  rol: ClaveRol;
  permisos: readonly CodigoPermiso[];
}

const CLAVE = 'cuspide.sesion';

/** El evento con el que los componentes se enteran del cambio de sesión. */
const CAMBIO = 'cuspide:sesion';

function leer(): UsuarioDeSesion | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as UsuarioDeSesion) : null;
  } catch {
    // `sessionStorage` puede fallar en ventana privada o con las cookies bloqueadas.
    return null;
  }
}

function guardar(u: UsuarioDeSesion | null): void {
  try {
    if (u) sessionStorage.setItem(CLAVE, JSON.stringify(u));
    else sessionStorage.removeItem(CLAVE);
  } catch {
    /* Sin persistencia la sesión dura lo que dure la pantalla. Alcanza para la demo. */
  }
  window.dispatchEvent(new Event(CAMBIO));
}

export function useSesion() {
  const [usuario, setUsuario] = useState<UsuarioDeSesion | null>(() => leer());

  useEffect(() => {
    const alCambiar = () => setUsuario(leer());
    window.addEventListener(CAMBIO, alCambiar);
    window.addEventListener('storage', alCambiar);
    return () => {
      window.removeEventListener(CAMBIO, alCambiar);
      window.removeEventListener('storage', alCambiar);
    };
  }, []);

  return { usuario, cargando: false, sinSesion: usuario === null };
}

export function useLogin() {
  const [ingresando, setIngresando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingresar = useCallback(async (nombreUsuario: string, contrasena: string) => {
    setIngresando(true);
    setError(null);
    // Una espera corta: sin ella el ingreso es instantáneo y se siente falso.
    await new Promise((listo) => setTimeout(listo, 350));

    const encontrado = USUARIOS.find(
      (u) => u.usuario.toLowerCase() === nombreUsuario.trim().toLowerCase(),
    );

    if (!encontrado || encontrado.contrasena !== contrasena) {
      setIngresando(false);
      // El mismo mensaje para usuario inexistente y contraseña incorrecta: decir cuál de las dos
      // falló le regala al atacante la mitad del trabajo.
      setError('Usuario o contraseña incorrectos.');
      return false;
    }

    guardar({
      usuario: encontrado.usuario,
      nombreCompleto: encontrado.nombreCompleto,
      rol: encontrado.rol,
      permisos: ROLES[encontrado.rol].permisos,
    });
    setIngresando(false);
    return true;
  }, []);

  return { ingresar, ingresando, error };
}

export function useLogout() {
  return useCallback(() => guardar(null), []);
}
