import { MAX_DELAY_MS, currentUser } from '@sweep/mocks';

import { useSession } from './useSession';

describe('useSession', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useSession.setState({ user: null, loading: false });
  });
  afterEach(() => jest.useRealTimers());

  it('flags loading while the user resolves, then holds the hardcoded user', async () => {
    const pending = useSession.getState().load();

    expect(useSession.getState().loading).toBe(true);
    expect(useSession.getState().user).toBeNull();

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await pending;

    expect(useSession.getState().loading).toBe(false);
    expect(useSession.getState().user).toEqual(currentUser);
  });
});
