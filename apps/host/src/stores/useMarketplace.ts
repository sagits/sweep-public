import { createSearch, fetchSearches } from '@sweep/mocks';
import type { CleanerSearch, NewSearch } from '@sweep/types';
import { create } from 'zustand';

import { mergeFetched } from './merge';
import { once } from './once';

type MarketplaceState = {
  searches: CleanerSearch[];
  loading: boolean;
  /** Set once the seed has arrived, so re-entering the tab never seeds over a posted search. */
  loaded: boolean;
  load: () => Promise<void>;
  /** Pull-to-refresh: re-runs the fetch, skeletons and all, outside the load guard. */
  reload: () => Promise<void>;
  post: (input: NewSearch) => Promise<CleanerSearch>;
  find: (id: string) => CleanerSearch | undefined;
};

export const useMarketplace = create<MarketplaceState>((set, get) => ({
  searches: [],
  loading: false,
  loaded: false,
  load: once(() => get().reload()),
  reload: async () => {
    set({ loading: true });
    const fetched = await fetchSearches();
    set((state) => ({
      searches: mergeFetched(fetched, state.searches),
      loading: false,
      loaded: true,
    }));
  },
  post: async (input) => {
    // A search is posted on top of the open ones, so the seed has to be in first.
    await get().load();
    const search = await createSearch(input);
    set((state) => ({ searches: [...state.searches, search] }));
    return search;
  },
  find: (id) => get().searches.find((search) => search.id === id),
}));
