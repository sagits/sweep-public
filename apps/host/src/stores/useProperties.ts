import { createProperty, fetchProperties } from '@sweep/mocks';
import type { NewProperty, Property } from '@sweep/types';
import { create } from 'zustand';

import { mergeFetched } from './merge';
import { once } from './once';

type PropertiesState = {
  properties: Property[];
  loading: boolean;
  /** Set once the seed has arrived, so re-entering the tab never seeds over what was added. */
  loaded: boolean;
  load: () => Promise<void>;
  /** Pull-to-refresh: re-runs the fetch, skeletons and all, outside the load guard. */
  reload: () => Promise<void>;
  add: (input: NewProperty) => Promise<Property>;
};

export const useProperties = create<PropertiesState>((set, get) => ({
  properties: [],
  loading: false,
  loaded: false,
  load: once(() => get().reload()),
  reload: async () => {
    set({ loading: true });
    const fetched = await fetchProperties();
    set((state) => ({
      properties: mergeFetched(fetched, state.properties),
      loading: false,
      loaded: true,
    }));
  },
  add: async (input) => {
    const property = await createProperty(input);
    set((state) => ({ properties: [...state.properties, property] }));
    return property;
  },
}));
