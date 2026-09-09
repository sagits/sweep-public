import { fetchPayments } from '@sweep/mocks';
import type { Payment } from '@sweep/types';
import { create } from 'zustand';

import { once } from './once';

type PaymentsState = {
  payments: Payment[];
  loading: boolean;
  load: () => Promise<void>;
  /** Pull-to-refresh: re-runs the fetch, skeletons and all, outside the load guard. */
  reload: () => Promise<void>;
};

export const usePayments = create<PaymentsState>((set, get) => ({
  payments: [],
  loading: false,
  load: once(() => get().reload()),
  reload: async () => {
    set({ loading: true });
    const payments = await fetchPayments();
    set({ payments, loading: false });
  },
}));
