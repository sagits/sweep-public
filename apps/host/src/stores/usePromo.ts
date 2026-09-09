import { create } from 'zustand';

type PromoState = {
  dismissed: boolean;
  /** "Don't show this anymore" — in memory, so it holds for the session and resets on relaunch. */
  dismiss: () => void;
};

export const usePromo = create<PromoState>((set) => ({
  dismissed: false,
  dismiss: () => set({ dismissed: true }),
}));
