import { fetchNotifications } from '@sweep/mocks';
import type { Notification } from '@sweep/types';
import { create } from 'zustand';

import { once } from './once';

type NotificationsState = {
  notifications: Notification[];
  loading: boolean;
  load: () => Promise<void>;
  /** Pull-to-refresh: re-runs the fetch, skeletons and all, outside the load guard. */
  reload: () => Promise<void>;
};

export const useNotifications = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: false,
  load: once(() => get().reload()),
  reload: async () => {
    set({ loading: true });
    const notifications = await fetchNotifications();
    set({ notifications, loading: false });
  },
}));
