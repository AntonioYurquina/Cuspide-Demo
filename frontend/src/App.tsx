/**
 * Las rutas del sistema, que son **dos sistemas**.
 *
 * `/`, `/turnos-online` y `/tienda` son el sitio público: no piden sesión, no piden cuenta y son
 * la puerta de entrada del paciente. El resto es el panel de gestión y exige sesión.
 *
 * Que la raíz sea el sitio y no el login es la decisión de fondo: el producto no es un sistema de
 * gestión con una página al lado, es **un centro de salud en internet** que además se administra.
 * Quien trabaja ahí entra una vez por el enlace del pie; el paciente entra cien veces y nunca ve
 * una pantalla de ingreso.
 *
 * Cada pantalla se protege por permiso, no sólo por sesión: entrar a `/facturacion` escribiendo
 * la URL, con un usuario que no lo tiene, cae en «no tenés permiso» y no en la pantalla.
 *
 * > En esta etapa eso es **cortesía visual**, no seguridad: no hay servidor que rechace nada. Lo
 * > que sí prueba es que el modelo de permisos está bien pensado y que la etapa dos sólo tiene
 * > que hacerlo cumplir del otro lado.
 */

import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';
import { useSesion } from './features/auth/useSesion.ts';
import { tienePermiso, PERMISOS, type CodigoPermiso } from './permisos.ts';
import { Tarjeta } from './components/ui.tsx';
import { PaginaLogin } from './pages/PaginaLogin.tsx';
import { PaginaAgenda } from './pages/PaginaAgenda.tsx';
import { PaginaTurnos } from './pages/PaginaTurnos.tsx';
import { PaginaPacientes } from './pages/PaginaPacientes.tsx';
import { PaginaLaboratorio } from './pages/PaginaLaboratorio.tsx';
import { PaginaProveedores } from './pages/PaginaProveedores.tsx';
import { PaginaFacturacion } from './pages/PaginaFacturacion.tsx';
import { PaginaContabilidad } from './pages/PaginaContabilidad.tsx';
import { PaginaUsuarios } from './pages/PaginaUsuarios.tsx';
import { PaginaConfiguracion } from './pages/PaginaConfiguracion.tsx';
import { MarcoPublico } from './publico/Marco.tsx';
import { PaginaSitio } from './publico/PaginaSitio.tsx';
import { PaginaTurnosOnline } from './publico/PaginaTurnosOnline.tsx';
import { PaginaTienda } from './publico/PaginaTienda.tsx';

function SinPermiso() {
  return (
    <div className="mx-auto max-w-lg">
      <Tarjeta className="p-8 text-center">
        <h1 className="text-xl font-bold text-gris-900">No tenés permiso para ver esto</h1>
        <p className="mt-2 text-sm text-gris-600">
          Tu rol no incluye esta sección. Si la necesitás, pedísela a quien administre el sistema.
        </p>
      </Tarjeta>
    </div>
  );
}

/** Exige sesión y, si se le pide, un permiso. */
function Protegida({ permiso, children }: { permiso?: CodigoPermiso; children: React.ReactNode }) {
  const { usuario } = useSesion();
  if (!usuario) return <Navigate to="/login" replace />;
  return (
    <Layout>
      {permiso && !tienePermiso(usuario.permisos, permiso) ? <SinPermiso /> : children}
    </Layout>
  );
}

export function App() {
  const { usuario } = useSesion();

  const pantallas: { ruta: string; permiso: CodigoPermiso; elemento: React.ReactNode }[] = [
    { ruta: '/agenda', permiso: PERMISOS.AGENDA_VER, elemento: <PaginaAgenda /> },
    { ruta: '/turnos', permiso: PERMISOS.TURNOS_VER, elemento: <PaginaTurnos /> },
    { ruta: '/pacientes', permiso: PERMISOS.PACIENTES_VER, elemento: <PaginaPacientes /> },
    { ruta: '/laboratorio', permiso: PERMISOS.LABORATORIO_VER, elemento: <PaginaLaboratorio /> },
    { ruta: '/proveedores', permiso: PERMISOS.PROVEEDORES_VER, elemento: <PaginaProveedores /> },
    { ruta: '/facturacion', permiso: PERMISOS.FACTURACION_VER, elemento: <PaginaFacturacion /> },
    { ruta: '/contabilidad', permiso: PERMISOS.CONTABILIDAD_VER, elemento: <PaginaContabilidad /> },
    { ruta: '/usuarios', permiso: PERMISOS.USUARIOS_VER, elemento: <PaginaUsuarios /> },
    {
      ruta: '/configuracion',
      permiso: PERMISOS.CONFIGURACION_VER,
      elemento: <PaginaConfiguracion />,
    },
  ];

  const publicas: { ruta: string; elemento: React.ReactNode }[] = [
    { ruta: '/', elemento: <PaginaSitio /> },
    { ruta: '/turnos-online', elemento: <PaginaTurnosOnline /> },
    { ruta: '/tienda', elemento: <PaginaTienda /> },
  ];

  return (
    <Routes>
      {publicas.map((p) => (
        <Route key={p.ruta} path={p.ruta} element={<MarcoPublico>{p.elemento}</MarcoPublico>} />
      ))}

      <Route
        path="/login"
        element={usuario ? <Navigate to="/agenda" replace /> : <PaginaLogin />}
      />
      {pantallas.map((p) => (
        <Route
          key={p.ruta}
          path={p.ruta}
          element={<Protegida permiso={p.permiso}>{p.elemento}</Protegida>}
        />
      ))}
      {/* Una ruta que no existe cae en el sitio, no en el login: el visitante no tiene cuenta. */}
      <Route path="*" element={<Navigate to={usuario ? '/agenda' : '/'} replace />} />
    </Routes>
  );
}
