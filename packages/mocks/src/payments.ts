import type { Payment } from '@sweep/types';

import { resolve } from './resolve';
import { seeded } from './seed';

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

/**
 * The Payments tab opens populated; screenshot `22`'s folder is the seed-off state, reached with
 * `EXPO_PUBLIC_SEED=false`. Cleaners and properties match the seeds used elsewhere.
 */
export const seededPayments: Payment[] = [
  {
    id: 'payment-1',
    cleanerName: 'Ramona',
    propertyAlias: 'Beach apartment, Los Angeles #22',
    paidAt: daysAgo(2),
    amount: 100,
  },
  {
    id: 'payment-2',
    cleanerName: 'Jairo',
    propertyAlias: 'Lake house',
    paidAt: daysAgo(9),
    amount: 125,
  },
  {
    id: 'payment-3',
    cleanerName: 'Aurea',
    propertyAlias: 'Downtown loft',
    paidAt: daysAgo(16),
    amount: 150,
  },
  {
    id: 'payment-4',
    cleanerName: 'Ramona',
    propertyAlias: 'Beach apartment, Los Angeles #22',
    paidAt: daysAgo(30),
    amount: 100,
  },
];

export const fetchPayments = (): Promise<Payment[]> => resolve(seeded(seededPayments));
