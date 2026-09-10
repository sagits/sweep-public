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
  /** The notifications list's "Mark all as read" row — what empties Home's bell badge. */
  markAllRead: () => void;
};

/** Home's bell badge, and the mint tint on a list row. */
export const unreadCount = (notifications: Notification[]) =>
  notifications.filter((notification) => !notification.read).length;

export const useNotifications = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: false,
  load: once(() => get().reload()),
  reload: async () => {
    set({ loading: true });
    const fetched = await fetchNotifications();
    // The mock always resolves the seed unread, so a refresh would otherwise un-read the list
    // and bring the badge back. Read is session state; it survives the re-fetch.
    set((state) => {
      const read = new Set(
        state.notifications.filter((notification) => notification.read).map(({ id }) => id),
      );
      return {
        notifications: fetched.map((notification) =>
          read.has(notification.id) ? { ...notification, read: true } : notification,
        ),
        loading: false,
      };
    });
  },
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.read ? notification : { ...notification, read: true },
      ),
    })),
}));
