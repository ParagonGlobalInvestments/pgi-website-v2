const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Add coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Collect coverage from these directories
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/pages/_*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],
  // Mock CSS modules and static assets
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig);
