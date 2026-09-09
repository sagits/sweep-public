import { fetchPayments } from '@sweep/mocks';
import type { Payment } from '@sweep/types';
import { create } from 'zustand';

import { once } from './once';

type PaymentsState = {
  payments: Payment[];
  loading: boolean;
  load: () => Promise<void>;
};

export const usePayments = create<PaymentsState>((set) => ({
  payments: [],
  loading: false,
  load: once(async () => {
    set({ loading: true });
    const payments = await fetchPayments();
    set({ payments, loading: false });
  }),
}));
