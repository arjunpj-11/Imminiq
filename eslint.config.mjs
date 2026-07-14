import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: [
      'eslint.config.js',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['apps/api/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['apps/api/vitest.config.ts'],
        },
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          filter: {
            regex: '^(Window|User|Request)$',
            match: false,
          },
          custom: {
            regex: '^I[A-Z]',
            match: true,
          },
        },
        {
          selector: ['typeAlias', 'class', 'enum'],
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
      ],
    },
  },

  {
    files: ['apps/api/src/**/application/dtos/**/*.ts', 'apps/api/src/**/*.dto.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^(?!I[A-Z]).*DTO$',
            match: true,
          },
        },
        {
          selector: ['typeAlias', 'class'],
          format: ['PascalCase'],
          custom: {
            regex: '^(?!I[A-Z]).*DTO$',
            match: true,
          },
        },
      ],
    },
  },

  // Clean Architecture dependency rule: dependencies may only point inward.
  {
    files: ['apps/api/src/modules/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'express', message: 'Domain code cannot depend on HTTP frameworks.' },
            { name: 'mongoose', message: 'Map persistence values in infrastructure adapters.' },
            { name: 'ioredis', message: 'Depend on a domain port instead.' },
            { name: 'bullmq', message: 'Depend on a domain port instead.' },
            { name: 'jsonwebtoken', message: 'Depend on a domain token port instead.' },
            { name: 'zod', message: 'Validation schemas belong at the presentation boundary.' },
          ],
          patterns: [
            {
              group: [
                '**/application/**',
                '**/presentation/**',
                '**/infrastructure/**',
                '**/*.factory',
              ],
              message: 'Domain dependencies must point inward only.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/src/modules/**/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'express', message: 'HTTP types belong in presentation.' },
            { name: 'mongoose', message: 'Map persistence values in infrastructure adapters.' },
            { name: 'ioredis', message: 'Depend on an inward-facing port.' },
            { name: 'bullmq', message: 'Depend on an inward-facing port.' },
            { name: 'jsonwebtoken', message: 'Depend on an inward-facing token port.' },
            { name: 'crypto', message: 'Cryptographic implementations belong in infrastructure.' },
            {
              name: 'node:crypto',
              message: 'Cryptographic implementations belong in infrastructure.',
            },
          ],
          patterns: [
            {
              group: [
                '**/presentation/**',
                '**/infrastructure/**',
                '**/*.factory',
                '**/config/**',
                '**/middlewares/**',
              ],
              message: 'Application dependencies must not point to outer layers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/src/modules/**/presentation/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**'],
              message: 'Presentation must not depend directly on infrastructure.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/src/modules/**/presentation/**/*.controller.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**', '**/*.factory'],
              message:
                'Controllers must depend on application contracts, not composition or infrastructure.',
            },
          ],
        },
      ],
    },
  },

  /**
   * Test files are intentionally outside the main API tsconfig project.
   * Disable ESLint project-service typing here so CI can lint test files
   * without parser errors.
   */
  {
    files: ['apps/api/tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: false,
        project: false,
      },
    },
  },

  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          filter: {
            regex: '^Window$',
            match: false,
          },
          custom: {
            regex: '^I[A-Z]',
            match: true,
          },
        },
        {
          selector: ['typeAlias', 'class', 'enum'],
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
      ],
    },
  }
);
