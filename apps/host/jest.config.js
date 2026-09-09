/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // The TDD seam of ADR-0001 spans host stores and the shared mock resolvers,
  // so one runner covers both.
  roots: ['<rootDir>/app', '<rootDir>/src', '<rootDir>/../../packages'],
  // e2e/ holds Detox specs — they only run under `pnpm e2e:test`.
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '/dist/', '/ios/', '/android/'],
};
