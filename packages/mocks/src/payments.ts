import type { Payment } from '@sweep/types';

import { resolve } from './resolve';

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

/**
 * The Payments tab opens populated: the PRD ships the real app's empty state only as the
 * cleared-list case. Cleaners and properties match the seeds used elsewhere.
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

export const fetchPayments = (): Promise<Payment[]> => resolve(seededPayments);
