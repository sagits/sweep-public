import { MAX_DELAY_MS, seededSearches } from '@sweep/mocks';

import { resetLoads } from './once';
import { useMarketplace } from './useMarketplace';

const NEW_SEARCH = {
  propertyId: 'property-2',
  propertyAlias: 'Lake house',
  unit: '',
  bedrooms: 3,
  beds: 4,
  bathrooms: 2,
  unitSize: 1800,
  unitSizeUnit: 'sq. ft.' as const,
  notes: '',
};

/** Long enough for a seed and a post to resolve back to back, with their microtasks flushed. */
const settle = async <T,>(pending: Promise<T>) => {
  await jest.advanceTimersByTimeAsync(MAX_DELAY_MS * 3);
  return pending;
};

describe('useMarketplace', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetLoads();
    useMarketplace.setState({ searches: [], loading: false, loaded: false });
  });
  afterEach(() => jest.useRealTimers());

  it('is loading before the mock delay passes, so the list can show its skeletons', async () => {
    const pending = useMarketplace.getState().load();

    expect(useMarketplace.getState().loading).toBe(true);

    await settle(pending);

    expect(useMarketplace.getState().loading).toBe(false);
    expect(useMarketplace.getState().searches).toEqual(seededSearches);
  });

  it('adds a posted search to the open searches, carrying its bids', async () => {
    await settle(useMarketplace.getState().load());

    const posted = await settle(useMarketplace.getState().post(NEW_SEARCH));

    const { searches } = useMarketplace.getState();
    expect(searches).toHaveLength(seededSearches.length + 1);
    expect(searches.at(-1)).toEqual(posted);
    expect(posted.propertyAlias).toBe('Lake house');
    expect(posted.bids.map((bid) => bid.cleaner.name)).toEqual(['Ramona', 'Jairo', 'Aurea']);
  });

  it('posting before the seed has arrived keeps both — the wizard can be deep-linked', async () => {
    // No `load()` first: this is what reaching /search/new directly does.
    const posted = await settle(useMarketplace.getState().post(NEW_SEARCH));

    const { searches } = useMarketplace.getState();
    expect(searches).toHaveLength(seededSearches.length + 1);
    expect(searches.at(-1)).toEqual(posted);
    expect(useMarketplace.getState().find(posted.id)).toEqual(posted);
  });

  it('finds a search by id, so the bids list can be deep-linked', async () => {
    await settle(useMarketplace.getState().load());
    const posted = await settle(useMarketplace.getState().post(NEW_SEARCH));

    expect(useMarketplace.getState().find(posted.id)).toEqual(posted);
    expect(useMarketplace.getState().find('search-nope')).toBeUndefined();
  });

  it('keeps the posted search for the session — a second load does not re-seed over it', async () => {
    await settle(useMarketplace.getState().load());
    await settle(useMarketplace.getState().post(NEW_SEARCH));

    await settle(useMarketplace.getState().load());

    expect(useMarketplace.getState().searches).toHaveLength(seededSearches.length + 1);
  });
});
