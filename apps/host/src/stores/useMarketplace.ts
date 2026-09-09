import { createSearch, fetchSearches } from '@sweep/mocks';
import type { CleanerSearch, NewSearch } from '@sweep/types';
import { create } from 'zustand';

type MarketplaceState = {
  searches: CleanerSearch[];
  loading: boolean;
  /** Set once the seed has arrived, so re-entering the tab never seeds over a posted search. */
  loaded: boolean;
  load: () => Promise<void>;
  post: (input: NewSearch) => Promise<CleanerSearch>;
  find: (id: string) => CleanerSearch | undefined;
};

/**
 * The one in-flight seed request. A `loading` flag alone is not enough: a second caller would
 * see it and return immediately, and the seed landing afterwards would overwrite whatever it had
 * appended in the meantime. Deep-linking straight to the wizard did exactly that — the posted
 * search vanished the moment the bid list asked for the seed.
 */
let seeding: Promise<void> | null = null;

export const useMarketplace = create<MarketplaceState>((set, get) => ({
  searches: [],
  loading: false,
  loaded: false,
  load: () => {
    if (get().loaded) return Promise.resolve();
    seeding ??= (async () => {
      set({ loading: true });
      const searches = await fetchSearches();
      set({ searches, loading: false, loaded: true });
    })();
    return seeding;
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

/** Tests reset the store; the module-level request has to go with it. */
export const resetSeeding = () => {
  seeding = null;
};
