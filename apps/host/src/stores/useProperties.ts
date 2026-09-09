import { createProperty, fetchProperties } from '@sweep/mocks';
import type { NewProperty, Property } from '@sweep/types';
import { create } from 'zustand';

type PropertiesState = {
  properties: Property[];
  loading: boolean;
  /** Set once the seed has arrived, so re-entering the tab never seeds over what was added. */
  loaded: boolean;
  load: () => Promise<void>;
  add: (input: NewProperty) => Promise<Property>;
};

export const useProperties = create<PropertiesState>((set, get) => ({
  properties: [],
  loading: false,
  loaded: false,
  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    const properties = await fetchProperties();
    set({ properties, loading: false, loaded: true });
  },
  add: async (input) => {
    const property = await createProperty(input);
    set((state) => ({ properties: [...state.properties, property] }));
    return property;
  },
}));
