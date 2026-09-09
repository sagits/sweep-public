import { createSearch, fetchSearches, seededCleaners, seededSearches } from './marketplace';
import { seededProperties } from './properties';
import { MAX_DELAY_MS, MIN_DELAY_MS } from './resolve';

const NEW_SEARCH = {
  propertyId: 'property-2',
  propertyAlias: 'Lake house',
  unit: '',
  bedrooms: 3,
  beds: 4,
  bathrooms: 2,
  unitSize: 1800,
  unitSizeUnit: 'sq. ft.' as const,
  notes: 'Please pay attention to the balcony.',
};

describe('marketplace mocks', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('holds the searches back until the mock delay has passed, so skeletons are observable', async () => {
    let settled = false;
    void fetchSearches().then(() => {
      settled = true;
    });

    jest.advanceTimersByTime(MIN_DELAY_MS - 1);
    await Promise.resolve();
    expect(settled).toBe(false);

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await Promise.resolve();
    expect(settled).toBe(true);
  });

  it('seeds one open search per property, pointing at the real seeded properties', async () => {
    const pending = fetchSearches();
    jest.advanceTimersByTime(MAX_DELAY_MS);

    await expect(pending).resolves.toEqual(seededSearches);
    expect(seededSearches.map((search) => search.propertyId)).toEqual(
      seededProperties.map((property) => property.id)
    );
    expect(seededSearches.map((search) => search.propertyAlias)).toEqual(
      seededProperties.map((property) => property.alias)
    );
  });

  it('gives one search all three cleaners, at the prices the PRD pins', () => {
    const [first] = seededSearches;

    expect(first?.bids.map((bid) => [bid.cleaner.name, bid.price])).toEqual([
      ['Ramona', 100],
      ['Jairo', 125],
      ['Aurea', 150],
    ]);
    expect(first?.bids.map((bid) => [bid.cleaner.rating, bid.cleaner.reviewCount])).toEqual([
      [4.8, 22],
      [4.6, 191],
      [5, 11],
    ]);
    expect(seededCleaners).toHaveLength(3);
  });

  it('carries every bid back to its own search', () => {
    for (const search of seededSearches) {
      expect(search.bids.length).toBeGreaterThan(0);
      for (const bid of search.bids) {
        expect(bid.searchId).toBe(search.id);
        expect(bid.expiresInDays).toBe(2);
      }
    }
  });

  it('draws bids from all three cleaners for a newly posted search', async () => {
    const pending = createSearch(NEW_SEARCH);
    jest.advanceTimersByTime(MAX_DELAY_MS);
    const search = await pending;

    expect(search.propertyAlias).toBe('Lake house');
    expect(search.notes).toBe('Please pay attention to the balcony.');
    expect(search.bids.map((bid) => bid.cleaner.name)).toEqual(['Ramona', 'Jairo', 'Aurea']);
    expect(search.bids.every((bid) => bid.searchId === search.id)).toBe(true);
  });
});
