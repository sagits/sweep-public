import { MAX_DELAY_MS, MIN_DELAY_MS } from './resolve';
import { fetchProjects, seededProjects } from './projects';

describe('fetchProjects', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('holds the list back until the mock delay has passed, so the skeleton is observable', async () => {
    let settled = false;
    void fetchProjects().then(() => {
      settled = true;
    });

    jest.advanceTimersByTime(MIN_DELAY_MS - 1);
    await Promise.resolve();
    expect(settled).toBe(false);

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await Promise.resolve();
    expect(settled).toBe(true);
  });

  it('resolves the seeded projects', async () => {
    const pending = fetchProjects();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await expect(pending).resolves.toEqual(seededProjects);
  });
});
