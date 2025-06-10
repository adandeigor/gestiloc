import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Configurations de base
  pluginJs.configs.recommended,
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  prettierConfig, // Désactive les règles en conflit avec Prettier

  // Configuration spécifique
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      ecmaVersion: 2021,
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: pluginImport,
      prettier: pluginPrettier,
    },
    rules: {
      // Règles TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',

      // Règles pour les importations
      'import/no-unused-modules': 'error',
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc' },
          'newlines-between': 'always',
        },
      ],

      // Intégration Prettier
      'prettier/prettier': 'error',
    },
  },
];