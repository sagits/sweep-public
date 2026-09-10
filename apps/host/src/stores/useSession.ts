import { currentUser, resolve } from '@sweep/mocks';
import type { User } from '@sweep/types';
import { create } from 'zustand';

import { once } from './once';

type SessionState = {
  user: User | null;
  loading: boolean;
  /** There is no sign in — "logging in" is just resolving the hardcoded user. */
  load: () => Promise<void>;
  /** Pull-to-refresh on More: re-resolves the user, outside the load guard. */
  reload: () => Promise<void>;
};

export const useSession = create<SessionState>((set, get) => ({
  user: null,
  loading: false,
  load: once(() => get().reload()),
  reload: async () => {
    set({ loading: true });
    const user = await resolve(currentUser);
    set({ user, loading: false });
  },
}));
