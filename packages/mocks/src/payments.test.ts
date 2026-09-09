import { fetchPayments, seededPayments } from './payments';
import { MAX_DELAY_MS, MIN_DELAY_MS } from './resolve';

describe('fetchPayments', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('holds the list back until the mock delay has passed, so the skeleton is observable', async () => {
    let settled = false;
    void fetchPayments().then(() => {
      settled = true;
    });

    jest.advanceTimersByTime(MIN_DELAY_MS - 1);
    await Promise.resolve();
    expect(settled).toBe(false);

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await Promise.resolve();
    expect(settled).toBe(true);
  });

  it('resolves a populated history, newest first', async () => {
    const pending = fetchPayments();
    jest.advanceTimersByTime(MAX_DELAY_MS);

    await expect(pending).resolves.toEqual(seededPayments);
    expect(seededPayments.length).toBeGreaterThan(0);

    const times = seededPayments.map((payment) => Date.parse(payment.paidAt));
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });
});
