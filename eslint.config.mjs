import js from '@eslint/js';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import globals from 'globals';

const config = [
  {
    ignores: ['.open-next/**', '.wrangler/**', 'cloudflare-env.d.ts'],
  },
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Match the files eslint-config-next registers its plugins for.
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // React Compiler rules added in eslint-plugin-react-hooks v7. The app
      // does not use the compiler, so report these without failing lint.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow shadcn/ui-style `interface Props extends Base {}`.
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      'no-unused-expressions': 'warn',
      'import/no-anonymous-default-export': 'off',
    },
  },
  {
    // CommonJS files: Node scripts, Jest config, vendored packages.
    files: [
      '**/*.cjs',
      'jest.config.js',
      'tailwind.config.mjs',
      'vendor/**/*.js',
    ],
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['jest.setup.js', '**/*.test.{ts,tsx}', '**/__tests__/**/*'],
    languageOptions: { globals: globals.jest },
  },
  {
    files: ['src/app/__tests__/**/*', 'scripts/**/*', 'docs/**/*'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];

export default config;
