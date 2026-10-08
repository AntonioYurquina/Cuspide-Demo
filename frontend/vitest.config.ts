import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    // Sin DOM: lo que se prueba acá no renderiza, lee archivos.
    environment: 'node',
  },
});
