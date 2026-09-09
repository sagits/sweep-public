import { currentUser, resolve } from '@sweep/mocks';
import type { User } from '@sweep/types';
import { create } from 'zustand';

type SessionState = {
  user: User | null;
  loading: boolean;
  /** There is no sign in — "logging in" is just resolving the hardcoded user. */
  load: () => Promise<void>;
};

export const useSession = create<SessionState>((set) => ({
  user: null,
  loading: false,
  load: async () => {
    set({ loading: true });
    const user = await resolve(currentUser);
    set({ user, loading: false });
  },
}));
