import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'site/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // La plata no se calcula con number. Esto no lo detecta el linter,
      // pero sí evita el `any` que lo deja pasar sin que nadie se entere.
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['frontend/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      'backend/tests/**/*.ts',
      'backend/prisma/seed.ts',
      'backend/prisma/seed-demo.ts',
      'backend/scripts/**/*.ts',
      // Los scripts de puesta en marcha son herramientas de línea de comandos:
      // imprimir en consola es literalmente lo que hacen.
      'scripts/**/*.mjs',
      'backend/scripts/**/*.mjs',
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettier,
);
