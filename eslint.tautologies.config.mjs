// Opt-in audit for conditions the type checker proves are always true or
// false: `npm run lint:tautologies`.
//
// It isn't part of `npm run lint` because these rules trust the types, and
// many guards in this codebase protect values whose types are wider in
// practice (index lookups, `as` casts on database rows, parsed JSON). Review
// each finding; don't delete a guard just because it's reported.
import tseslint from 'typescript-eslint';
import baseConfig from './eslint.config.mjs';

// Register the main config's plugins (without their rules) so existing
// eslint-disable comments still resolve.
const plugins = Object.assign({}, ...baseConfig.map(c => c.plugins ?? {}));

const config = [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { ...plugins, '@typescript-eslint': tseslint.plugin },
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
    },
  },
];

export default config;
