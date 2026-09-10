import { MAX_DELAY_MS, seededNotifications } from '@sweep/mocks';

import { resetLoads } from './once';

import { useNotifications } from './useNotifications';

describe('useNotifications', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetLoads();
    useNotifications.setState({ notifications: [], loading: false });
  });
  afterEach(() => jest.useRealTimers());

  it('is loading with nothing to show until the mock delay passes', async () => {
    const pending = useNotifications.getState().load();

    expect(useNotifications.getState().loading).toBe(true);
    expect(useNotifications.getState().notifications).toEqual([]);

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await pending;

    expect(useNotifications.getState().loading).toBe(false);
    expect(useNotifications.getState().notifications).toEqual(seededNotifications);
  });

  it('counts what the header bell badges', async () => {
    const pending = useNotifications.getState().load();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await pending;

    expect(useNotifications.getState().notifications).toHaveLength(3);
  });

  it('re-fetches on reload, so pull-to-refresh is not a no-op behind the load guard', async () => {
    const first = useNotifications.getState().load();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await first;

    const pending = useNotifications.getState().reload();

    expect(useNotifications.getState().loading).toBe(true);
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await pending;
    expect(useNotifications.getState().notifications).toEqual(seededNotifications);
  });
});
