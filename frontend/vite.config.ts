import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Tailwind v4 se instala como plugin de Vite. No hay tailwind.config.js ni
// PostCSS: la configuración va con @theme dentro del CSS.
import tailwindcss from '@tailwindcss/vite';

/**
 * Bajo qué prefijo se sirve la aplicación.
 *
 * Por omisión la raíz, que es como corre en desarrollo. El prefijo se pasa sólo cuando hace
 * falta —por ejemplo, para publicar en GitHub Pages bajo `/Cuspide-Demo/`— y es **configuración,
 * no una bifurcación**: la misma fuente sirve en los dos lugares.
 *
 * Vite exige que empiece y termine en barra. React Router, en cambio, exige que NO termine en
 * barra, así que el `basename` la saca. Las dos reglas salen de este único valor.
 */
const base = process.env.CUSPIDE_BASE ?? '/';
if (!base.startsWith('/') || !base.endsWith('/')) {
  throw new Error(`CUSPIDE_BASE tiene que empezar y terminar en barra, y vino «${base}»`);
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  // Puerto fijo para el desarrollo.
  server: { port: 5176, strictPort: true },
  build: { outDir: 'dist', sourcemap: false },
});
