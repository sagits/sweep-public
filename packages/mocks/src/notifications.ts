import type { Notification } from '@sweep/types';

import { resolve } from './resolve';
import { seeded } from './seed';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

/** Home opens with notifications already in it — the bell badge counts these. */
export const seededNotifications: Notification[] = [
  {
    id: 'notification-1',
    message:
      'New bid to clean Beach apartment, Los Angeles #22, Los Angeles. It will expire in 48 hours',
    at: minutesAgo(3),
  },
  {
    id: 'notification-2',
    message: 'Your project at Lake house is still unassigned. It is due in 24 hours',
    at: minutesAgo(95),
  },
  {
    id: 'notification-3',
    message: 'Ramona accepted your invitation to join your team at Downtown loft',
    at: minutesAgo(300),
  },
];

export const fetchNotifications = (): Promise<Notification[]> =>
  resolve(seeded(seededNotifications));
