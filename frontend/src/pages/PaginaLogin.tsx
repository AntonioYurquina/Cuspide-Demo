/**
 * Pantalla de ingreso.
 *
 * Panel dividido: la marca sobre el odontograma a la izquierda, el formulario sobre una tarjeta
 * a la derecha. Se eligió porque una tarjeta
 * centrada en una pantalla de 1440 deja el 80 % sin hacer nada, y lo más grande de todo termina
 * siendo un formulario vacío.
 *
 * **La demo muestra las credenciales en pantalla.** No es un descuido: el sentido de esta etapa
 * es que alguien se siente y entre, y que pueda cambiar de rol para ver cómo cambia el sistema.
 * En la etapa dos este bloque se borra —son seis líneas— junto con `datos/usuarios.ts`.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../features/auth/useSesion.ts';
import { Aviso, Boton, Campo, Entrada } from '../components/ui.tsx';
import { Logo } from '../components/Logo.tsx';
import { MARCA } from '../marca.ts';
import { useEspecialidad } from '../especialidades/index.ts';
import { USUARIOS } from '../datos/usuarios.ts';
import { ROLES } from '../permisos.ts';

export function PaginaLogin() {
  const { e } = useEspecialidad();
  const navegar = useNavigate();
  const { ingresar, ingresando, error } = useLogin();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const alEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await ingresar(usuario, contrasena)) navegar('/agenda');
  };

  /** Entra con un clic: en una demo, tipear tres veces la misma contraseña sobra. */
  const entrarComo = async (u: string) => {
    setUsuario(u);
    setContrasena('demo');
    if (await ingresar(u, 'demo')) navegar('/agenda');
  };

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[1.5fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-tinta-950 bg-[linear-gradient(160deg,var(--color-tinta-degradado)_0%,var(--color-tinta-950)_62%)] px-15 py-14 text-tinta-100 shadow-[8px_0_32px_-12px_rgba(17,33,42,.45)] lg:flex">
        {MARCA.imagenFondoLogin ? (
          <img
            src={MARCA.imagenFondoLogin}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover opacity-45"
          />
        ) : (
          // El arte lo pone la vertical: esta pantalla no sabe cuál es.
          <e.ArteLogin />
        )}

        <div className="relative">
          <Logo tamano="grande" />
        </div>

        <div className="relative max-w-[19em]">
          <h1 className="text-[34px] leading-[1.18] font-bold tracking-[-.02em] text-white">
            De la agenda al balance.
          </h1>
          <p className="mt-3.5 text-[15px] leading-relaxed text-tinta-300">
            Turnos, pacientes, encargos, proveedores y facturación, en un solo lugar.
          </p>
        </div>

        <div className="relative flex gap-8 border-t border-tinta-borde pt-5 text-xs text-tinta-200">
          <div>
            <b className="mb-0.5 block font-semibold text-tinta-100">Permisos por rol</b>
            Cada uno ve lo suyo
          </div>
          <div>
            <b className="mb-0.5 block font-semibold text-tinta-100">Listo para ARCA</b>
            Comprobantes emitidos y recibidos
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh flex-col items-center justify-center bg-gris-100 px-6 py-12 lg:min-h-0">
        <div className="w-full max-w-sm">
          <div className="mb-7 flex justify-center lg:hidden">
            <Logo tamano="grande" sobre="claro" />
          </div>

          <div className="rounded-2xl border border-gris-200 bg-white p-9 shadow-[0_1px_1px_rgba(17,33,42,.04),0_2px_4px_rgba(17,33,42,.04),0_20px_48px_-20px_rgba(17,33,42,.28)]">
            <h2 className="text-2xl font-bold tracking-[-.015em] text-gris-900">Ingresar</h2>
            <p className="mt-1.5 mb-7 text-sm text-gris-600">
              Usá el usuario y la contraseña de tu cuenta.
            </p>

            <form onSubmit={(e) => void alEnviar(e)} noValidate className="space-y-4">
              {error && <Aviso>{error}</Aviso>}

              <Campo etiqueta="Usuario">
                <Entrada
                  autoFocus
                  autoComplete="username"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </Campo>

              <Campo etiqueta="Contraseña">
                <Entrada
                  type="password"
                  autoComplete="current-password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </Campo>

              <Boton type="submit" disabled={ingresando} className="w-full">
                {ingresando ? 'Ingresando…' : 'Ingresar'}
              </Boton>
            </form>
          </div>

          {/* Se borra entero en la etapa dos, junto con `datos/usuarios.ts`. */}
          <div className="mt-5 rounded-2xl border border-dashed border-gris-300 bg-white/60 p-5">
            <p className="text-xs font-semibold text-gris-700">Demostración · entrá con un clic</p>
            <p className="mt-1 text-xs text-gris-600">
              Cada rol ve un sistema distinto. Probá los tres.
            </p>
            <div className="mt-3 space-y-1.5">
              {USUARIOS.map((u) => (
                <button
                  key={u.usuario}
                  type="button"
                  onClick={() => void entrarComo(u.usuario)}
                  className="block w-full rounded-[9px] border border-gris-200 bg-white px-3 py-2 text-left transition-colors hover:border-marca-400 hover:bg-marca-50"
                >
                  <span className="block text-sm font-medium text-gris-900">
                    {ROLES[u.rol].nombre}
                  </span>
                  <span className="block text-xs text-gris-600">
                    {u.nombreCompleto} · {ROLES[u.rol].descripcion}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gris-500">{MARCA.nombre}</p>
        </div>
      </section>
    </main>
  );
}
