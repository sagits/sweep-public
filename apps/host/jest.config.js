/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // The TDD seam of ADR-0001 spans host stores and the shared mock resolvers,
  // so one runner covers both.
  roots: ['<rootDir>/app', '<rootDir>/src', '<rootDir>/../../packages'],
  // e2e/ holds Detox specs — they only run under `pnpm e2e:test`.
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '/dist/', '/ios/', '/android/'],
  // Jest's 5s default is not enough for the first run in a fresh clone. With no transform cache
  // the 25 suites compete for workers, the properties form's suite takes ~22s, and its `findBy*`
  // waits time out — so `pnpm test` fails once on a clean checkout and passes on every run after.
  // The suite is fast when warm; this only has to cover the cold start.
  testTimeout: 20000,
};
