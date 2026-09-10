import { MAX_DELAY_MS, seededPayments } from '@sweep/mocks';

import { resetLoads } from './once';

import { usePayments } from './usePayments';

describe('usePayments', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetLoads();
    usePayments.setState({ payments: [], loading: false });
  });
  afterEach(() => jest.useRealTimers());

  it('is loading before the mock delay passes, so the list can show its skeleton', async () => {
    const pending = usePayments.getState().load();

    expect(usePayments.getState().loading).toBe(true);

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await pending;

    expect(usePayments.getState().loading).toBe(false);
    expect(usePayments.getState().payments).toEqual(seededPayments);
  });

  it('re-fetches on reload, so pull-to-refresh is not a no-op behind the load guard', async () => {
    const first = usePayments.getState().load();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await first;

    const pending = usePayments.getState().reload();

    expect(usePayments.getState().loading).toBe(true);
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await pending;
    expect(usePayments.getState().payments).toEqual(seededPayments);
  });
});
