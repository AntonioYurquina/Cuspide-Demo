import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import { ProveedorEspecialidad } from './especialidades/index.ts';
import './estilos.css';

const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * El prefijo bajo el que vive la aplicación, como lo quiere React Router.
 *
 * `import.meta.env.BASE_URL` es lo que Vite dejó en el build —`/` o `/cuspide/`— y **la barra
 * final hay que sacarla**: con `basename="/cuspide/"`, React Router hace
 * `stripBasename("/cuspide", "/cuspide/")`, que devuelve `null`, y entonces **no renderiza
 * nada**. Pantalla en blanco, sin un solo error en la consola. Es el modo de falla más cruel de
 * servir una aplicación de una sola página bajo subruta.
 */
const prefijo = import.meta.env.BASE_URL.replace(/\/$/, '');

const contenedor = document.getElementById('root');
if (!contenedor) throw new Error('No se encontró el elemento #root');

createRoot(contenedor).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <ProveedorEspecialidad>
        <BrowserRouter basename={prefijo}>
          <App />
        </BrowserRouter>
      </ProveedorEspecialidad>
    </QueryClientProvider>
  </StrictMode>,
);
