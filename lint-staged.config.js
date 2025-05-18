module.exports = {
  // Run ESLint on JS, TS, JSX, and TSX files
  '**/*.{js,jsx,ts,tsx}': ['eslint --fix'],

  // Format JS, TS, JSX, TSX, JSON, MD, and CSS files
  '**/*.{js,jsx,ts,tsx,json,md,css}': ['prettier --write'],

  // Run TypeScript compiler on TS and TSX files
  '**/*.{ts,tsx}': () => 'tsc --noEmit',
};
