import { MAX_DELAY_MS } from '@sweep/mocks';

import { useMarketplace, resetSeeding } from './useMarketplace';
import { useNotifications } from './useNotifications';
import { usePayments } from './usePayments';
import { useProjects } from './useProjects';
import { useProperties } from './useProperties';

/**
 * `EXPO_PUBLIC_SEED` is written here at run time, so it is declared locally rather than pulling
 * `@types/node` in. Under Metro and under jest-expo alike, babel-preset-expo rewrites the read to
 * `expo/virtual/env`, which *is* `process.env` — so a value set here is what the mocks see.
 */
declare const process: { env: Record<string, string | undefined> };

const setSeed = (value: string | undefined) => {
  if (value === undefined) delete process.env.EXPO_PUBLIC_SEED;
  else process.env.EXPO_PUBLIC_SEED = value;
};

const original = process.env.EXPO_PUBLIC_SEED;

/** Every store back to its initial state, including the marketplace's module-level request. */
const resetStores = () => {
  resetSeeding();
  useProperties.setState({ properties: [], loading: false, loaded: false });
  useProjects.setState({ projects: [], loading: false, loaded: false });
  useMarketplace.setState({ searches: [], loading: false, loaded: false });
  usePayments.setState({ payments: [], loading: false });
  useNotifications.setState({ notifications: [], loading: false });
};

/** Boots every list the way the app does on a cold launch, then runs the mock delay out. */
const bootApp = async () => {
  const pending = Promise.all([
    useProperties.getState().load(),
    useProjects.getState().load(),
    useMarketplace.getState().load(),
    usePayments.getState().load(),
    useNotifications.getState().load(),
  ]);
  jest.advanceTimersByTime(MAX_DELAY_MS);
  await pending;
};

const counts = () => ({
  properties: useProperties.getState().properties.length,
  projects: useProjects.getState().projects.length,
  searches: useMarketplace.getState().searches.length,
  payments: usePayments.getState().payments.length,
  notifications: useNotifications.getState().notifications.length,
});

describe('the seed toggle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetStores();
  });

  afterEach(() => {
    jest.useRealTimers();
    setSeed(original);
  });

  it('boots with three properties, three projects and three open searches when the seed is on', async () => {
    setSeed(undefined);

    await bootApp();

    expect(counts()).toEqual({
      properties: 3,
      projects: 3,
      searches: 3,
      payments: 4,
      notifications: 3,
    });
  });

  it('leaves the seed on for any value other than the documented `false`', async () => {
    setSeed('true');

    await bootApp();

    expect(counts().properties).toBe(3);
  });

  it('boots every store empty with EXPO_PUBLIC_SEED=false, so every empty state is reachable', async () => {
    setSeed('false');

    await bootApp();

    expect(counts()).toEqual({
      properties: 0,
      projects: 0,
      searches: 0,
      payments: 0,
      notifications: 0,
    });
  });

  it('is read per fetch, so nothing caches the seed from the module that loaded first', async () => {
    setSeed('false');
    await bootApp();
    expect(counts().payments).toBe(0);

    resetStores();
    setSeed(undefined);
    await bootApp();

    expect(counts().payments).toBe(4);
  });
});
