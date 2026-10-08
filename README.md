# Cúspide — demo

Demo navegable de **Cúspide**, un SaaS de gestión, administración y venta para consultorios de salud
(odontología, medicina, kinesiología). Un solo sistema que cambia su vocabulario, su ficha clínica y
sus documentos según la especialidad.

**Probala acá: https://antonioyurquina.github.io/Cuspide-Demo/**

## Qué se puede recorrer

- **Sitio público del centro** — presentación, turnos online y tienda de bonos. No pide cuenta.
- **Panel de gestión** — agenda, turnos, pacientes con ficha clínica, laboratorio, proveedores,
  facturación, contabilidad, usuarios y configuración.
- **Conmutador de especialidad** — en la barra superior. Cambia en vivo entre odontología,
  medicina y kinesiología: la agenda pasa de «Consultorio» a «Camilla», cambia la ficha clínica
  (odontograma, historia clínica, ficha kinésica) y cambian los documentos que se imprimen.
- **Roles y permisos** — el menú se arma según el rol: la secretaría no ve Facturación ni
  Contabilidad.
- **Documentos imprimibles** — consentimientos, planes de tratamiento y otros papeles con
  membrete, con vista previa idéntica al papel.

### Ingreso de prueba

El panel pide usuario y contraseña. Los tres roles usan la contraseña `demo`:

| Usuario | Rol |
|---|---|
| `admin` | Administrador |
| `secretaria` | Secretaría |
| `profesional` | Profesional |

## Lo que es y lo que no es

Es una **demo de frontend**: los datos son ficticios y están sembrados en el código, la sesión es
simulada y no hay backend ni base de datos. Los permisos ocultan pantallas pero no protegen nada,
porque no hay servidor que rechace una petición.

El producto completo (backend multi-inquilino, base de datos, despliegue) se mantiene en un
repositorio privado.

## Cómo está armado

```
shared/     lo que dicen igual el frontend y el backend: permisos y claves de especialidad
frontend/   la aplicación: panel de gestión y sitio público
```

**Stack:** TypeScript · React 19 · Vite · Tailwind CSS v4 · React Router · TanStack Query · Vitest.

La separación que gobierna el diseño: un **núcleo** idéntico para toda especialidad (agenda,
pacientes, administración, sitio, tienda) y una **vertical** que es lo único que cambia (ficha
clínica, vocabulario, documentos). Un test recorre las pantallas del núcleo y falla si alguna
escribe una palabra de especialidad.

## Desarrollo

```bash
pnpm install
pnpm dev          # http://localhost:5176
pnpm typecheck
pnpm test
pnpm lint
```

## Publicar en GitHub Pages

```bash
scripts/publicar-pages.sh
```

Compila con el prefijo `/Cuspide-Demo/`, copia `index.html` como `404.html` para que los enlaces
directos a una pantalla funcionen, y sube el resultado a la rama `gh-pages`.
