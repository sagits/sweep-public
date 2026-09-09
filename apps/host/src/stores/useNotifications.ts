import { fetchNotifications } from '@sweep/mocks';
import type { Notification } from '@sweep/types';
import { create } from 'zustand';

import { once } from './once';

type NotificationsState = {
  notifications: Notification[];
  loading: boolean;
  load: () => Promise<void>;
};

export const useNotifications = create<NotificationsState>((set) => ({
  notifications: [],
  loading: false,
  load: once(async () => {
    set({ loading: true });
    const notifications = await fetchNotifications();
    set({ notifications, loading: false });
  }),
}));
