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
  prettierConfig,

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
      'consistent-return': 'off', // Désactive les contrôles sur les retours de fonctions
    },
  },
];