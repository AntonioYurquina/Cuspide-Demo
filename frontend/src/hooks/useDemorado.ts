import { useEffect, useState } from 'react';

/**
 * Devuelve el valor recién cuando dejó de cambiar durante `ms` milisegundos.
 * Evita pegarle a la API con cada tecla de un buscador.
 */
export function useDemorado<T>(valor: T, ms = 300): T {
  const [demorado, setDemorado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setDemorado(valor), ms);
    return () => clearTimeout(temporizador);
  }, [valor, ms]);

  return demorado;
}
