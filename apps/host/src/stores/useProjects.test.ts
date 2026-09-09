import { MAX_DELAY_MS, seededProjects } from '@sweep/mocks';

import { useProjects } from './useProjects';

describe('useProjects', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useProjects.setState({ projects: [], loading: false });
  });
  afterEach(() => jest.useRealTimers());

  it('is loading before the mock delay passes, so Home can show its skeleton', async () => {
    const pending = useProjects.getState().load();

    expect(useProjects.getState().loading).toBe(true);

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await pending;

    expect(useProjects.getState().loading).toBe(false);
    expect(useProjects.getState().projects).toEqual(seededProjects);
  });
});
