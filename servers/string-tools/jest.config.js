export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  // Treat TS as ESM so Jest doesn't run tests in CJS mode
  extensionsToTreatAsEsm: ['.ts'],

  // Let Jest try .js first (packages), then .ts (your code)
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],

  // Only strip the .js suffix on relative imports; don't force ".ts"
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { 
        useESM: true,
        tsconfig: {
          module: 'esnext',
          target: 'es2020'
        }
      },
    ],
  },

  testMatch: ['**/src/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};