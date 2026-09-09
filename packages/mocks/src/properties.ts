import type { NewProperty, Property } from '@sweep/types';

import { resolve } from './resolve';

/**
 * The address the New Property form shows read-only. There is no address API in the PoC, so
 * every property registered through the form lands on this one.
 */
export const FIXED_ADDRESS = 'Los Angeles, CA 90001, USA';

/**
 * The app boots with three properties already registered — the aliases the seeded
 * notifications already name. `image` is an emoji rather than a shipped asset; the card
 * renders a house outline for a property without one, which is what the reference
 * screenshot shows.
 */
export const seededProperties: Property[] = [
  {
    id: 'property-1',
    alias: 'Beach apartment',
    address: '1100 Ocean Front Walk, Los Angeles',
    unit: '22',
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    unitSize: 1200,
    unitSizeUnit: 'sq. ft.',
    image: '🏖️',
    currency: 'USD',
    checkoutTime: '11:00 am',
    checkinTime: '3:00 pm',
    description: '',
  },
  {
    id: 'property-2',
    alias: 'Lake house',
    address: '815 Lakeshore Dr, Big Bear Lake',
    unit: '',
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    unitSize: 1800,
    unitSizeUnit: 'sq. ft.',
    image: '🏡',
    currency: 'USD',
    checkoutTime: '10:00 am',
    checkinTime: '4:00 pm',
    description: '',
  },
  {
    id: 'property-3',
    alias: 'Downtown loft',
    address: '600 S Spring St, Los Angeles',
    unit: '1204',
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    unitSize: 850,
    unitSizeUnit: 'sq. ft.',
    image: '🏙️',
    currency: 'USD',
    checkoutTime: '11:00 am',
    checkinTime: '3:00 pm',
    description: '',
  },
];

/**
 * ponytail: the seed switch is one env read until ticket 09 generalises it across every list.
 * `EXPO_PUBLIC_SEED=false pnpm dev` boots the app on the empty state. Expo inlines
 * `EXPO_PUBLIC_*` at bundle time; declared here rather than pulling `@types/node` into a package
 * that otherwise needs nothing from Node.
 */
declare const process: { env: Record<string, string | undefined> };

const seedEnabled = process.env.EXPO_PUBLIC_SEED !== 'false';

export const fetchProperties = (): Promise<Property[]> =>
  resolve(seedEnabled ? seededProperties : []);

export const createProperty = (input: NewProperty): Promise<Property> =>
  resolve({ ...input, id: `property-${Date.now()}` });
