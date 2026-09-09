import type { Bid, Cleaner, CleanerSearch, NewSearch, Property } from '@sweep/types';

import { seededProperties } from './properties';
import { resolve } from './resolve';
import { seeded } from './seed';

/**
 * The three cleaners the PRD names. Photos are emoji rather than shipped assets — the same call
 * ticket 03 made for property images, and the reference photos are real people's faces.
 */
const ramona: Cleaner = {
  id: 'cleaner-ramona',
  name: 'Ramona',
  photo: '👩🏽',
  rating: 4.8,
  reviewCount: 22,
  superCleaner: true,
  rentalHandyPro: true,
  backgroundChecked: true,
  completedProjects: 520,
  location: 'Los Angeles, CA',
  distanceMiles: 5,
  memberSince: 'July 2023',
  message:
    'Thanks for the opportunity to bid. I run a small, detail-focused turnover team and we treat ' +
    'every property like our own. Happy to work around your check-in and check-out times.',
  workPhotos: ['🛏️', '🛋️', '🚿', '🧺', '🍽️', '🪟'],
};

const jairo: Cleaner = {
  id: 'cleaner-jairo',
  name: 'Jairo',
  photo: '🧑🏻',
  rating: 4.6,
  reviewCount: 191,
  superCleaner: true,
  rentalHandyPro: true,
  backgroundChecked: true,
  completedProjects: 14418,
  location: 'Los Angeles, CA',
  distanceMiles: 2,
  memberSince: 'January 2018',
  message:
    "Thanks for the opportunity to bid. We're a professional housekeeping team available to " +
    'assist you. Our services include turnover cleaning, deep cleanings, light maintenance ' +
    'repairs, upholstery and carpet cleaning. In business for the past five years, we have ' +
    'helped many hosts run a smooth operation. References available upon request.',
  workPhotos: ['🛏️', '🚿', '🧹', '🪣', '🛋️', '🧴'],
};

/** Aurea carries neither the Super Cleaner chip nor the Rental Handy Pro line — see `14`/`15`. */
const aurea: Cleaner = {
  id: 'cleaner-aurea',
  name: 'Aurea',
  photo: '👩🏻',
  rating: 5,
  reviewCount: 11,
  superCleaner: false,
  rentalHandyPro: false,
  backgroundChecked: true,
  completedProjects: 96,
  location: 'Los Angeles, CA',
  distanceMiles: 8,
  memberSince: 'March 2024',
  message:
    'Thanks for the opportunity to bid. I clean short-term rentals full time and always send ' +
    'photos when a turnover is done, so you know the place is guest ready.',
  workPhotos: ['🛏️', '🪟', '🧽', '🚿', '🍽️', '🧺'],
};

export const seededCleaners: Cleaner[] = [ramona, jairo, aurea];

/** The prices the PRD pins: Ramona $100, Jairo $125, Aurea $150. */
const PRICES: Record<string, number> = {
  [ramona.id]: 100,
  [jairo.id]: 125,
  [aurea.id]: 150,
};

const EXPIRES_IN_DAYS = 2;

function bidsFor(searchId: string, cleaners: Cleaner[]): Bid[] {
  return cleaners.map((cleaner) => ({
    id: `bid-${searchId}-${cleaner.id}`,
    searchId,
    cleaner,
    price: PRICES[cleaner.id] ?? 100,
    expiresInDays: EXPIRES_IN_DAYS,
  }));
}

/** Every seeded search confirms the details of a real seeded property. */
function searchFor(property: Property, index: number, cleaners: Cleaner[]): CleanerSearch {
  const id = `search-${index + 1}`;
  return {
    id,
    propertyId: property.id,
    propertyAlias: property.alias,
    createdAt: new Date().toISOString(),
    unit: property.unit,
    bedrooms: property.bedrooms,
    beds: property.beds,
    bathrooms: property.bathrooms,
    unitSize: property.unitSize,
    unitSizeUnit: property.unitSizeUnit,
    notes: '',
    bids: bidsFor(id, cleaners),
  };
}

/** Who bid on which search. The first carries all three, per the PRD's seed. */
const BIDDERS: Cleaner[][] = [seededCleaners, [jairo], [ramona, aurea]];

/**
 * One open search per property, so the Marketplace and Home's Cleaner Search card are populated
 * from a cold launch.
 */
export const seededSearches: CleanerSearch[] = seededProperties.map((property, index) =>
  searchFor(property, index, BIDDERS[index] ?? seededCleaners)
);

export const fetchSearches = (): Promise<CleanerSearch[]> => resolve(seeded(seededSearches));

/** A posted search draws bids from all three cleaners, which is what the wizard lands on. */
export const createSearch = (input: NewSearch): Promise<CleanerSearch> => {
  const id = `search-${Date.now()}`;
  return resolve({
    ...input,
    id,
    createdAt: new Date().toISOString(),
    bids: bidsFor(id, seededCleaners),
  });
};
