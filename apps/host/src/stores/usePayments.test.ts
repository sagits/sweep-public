import { MAX_DELAY_MS, seededPayments } from '@sweep/mocks';

import { usePayments } from './usePayments';

describe('usePayments', () => {
  beforeEach(() => {
    jest.useFakeTimers();
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

  it('clears the history, which is what the empty state renders for', async () => {
    const pending = usePayments.getState().load();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await pending;

    usePayments.getState().clear();

    expect(usePayments.getState().payments).toEqual([]);
    expect(usePayments.getState().loading).toBe(false);
  });
});
