// eslint.config.js
// SchoolCBT ESLint Flat Config — ESLint 9 + TypeScript + Svelte

import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import sveltePlugin from 'eslint-plugin-svelte'
import svelteParser from 'svelte-eslint-parser'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: [
      'node_modules/**',
      '.commandcode/**',
      '.svelte-kit/**',
      'build/**',
      'dist/**',
      '.dev.vars',
      '.env*',
      '*.min.js',
      'convex/_generated/**',
      '.wrangler/**',
      '.cache/**',
      '**/*.json',
      'static/service-worker.js',
    ],
  },

  // 1. Base JavaScript rules
  js.configs.recommended,

  // 2. TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // 3. Svelte components
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      svelte: sveltePlugin,
    },
    processor: sveltePlugin.processors.svelte,
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      'svelte/no-at-html-tags': 'off',
      'svelte/no-unused-svelte-ignore': 'off',
      'svelte/valid-compile': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-useless-escape': 'off',
    },
  },

  // 4. JSON config files
  {
    files: ['*.json', '*.jsonc', '**/*.json', '**/*.jsonc'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },

  // 5. Disable rules that conflict with Prettier
  prettierConfig,

  // Ignore patterns are declared first so ESLint skips non-source files before parsing.
]
