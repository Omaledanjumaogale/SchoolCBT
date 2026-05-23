// eslint.config.js
// SchoolCBT ESLint Flat Config — ESLint 9 + TypeScript + Svelte

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // 1. Base JavaScript rules
  js.configs.recommended,

  // 2. TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }]
    }
  },

  // 3. Svelte components
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        sourceType: 'module',
        ecmaVersion: 'latest'
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      svelte: sveltePlugin
    },
    processor: sveltePlugin.processors.svelte,
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      'svelte/no-at-html-tags': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },

  // 4. JSON config files
  {
    files: ['*.json', '*.jsonc', '**/*.json', '**/*.jsonc'],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      'no-unused-vars': 'off'
    }
  },

  // 5. Disable rules that conflict with Prettier
  prettierConfig,

  // 6. Prettier formatting rules (applied last)
  {
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          semi: false,
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
          arrowParens: 'avoid',
          bracketSpacing: true,
          endOfLine: 'lf',
          plugins: []
        }
      ]
    }
  },

  // 7. Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.svelte-kit/**',
      'build/**',
      'dist/**',
      '.dev.vars',
      '.env*',
      '*.min.js',
      'convex/_generated/**',
      '.wrangler/**',
      '.cache/**'
    ]
  }
];