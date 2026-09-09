import { MAX_DELAY_MS, seededProperties } from '@sweep/mocks';

import { resetLoads } from './once';

import { useProperties } from './useProperties';

const NEW_PROPERTY = {
  alias: 'Beach house',
  address: 'Los Angeles, CA 90001, USA',
  unit: '22',
  bedrooms: 2,
  beds: 2,
  bathrooms: 1,
  unitSize: 200,
  unitSizeUnit: 'sq. mt.' as const,
  currency: 'USD',
  checkoutTime: '11:00 am',
  checkinTime: '3:00 pm',
  description: '',
};

describe('useProperties', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetLoads();
    useProperties.setState({ properties: [], loading: false, loaded: false });
  });
  afterEach(() => jest.useRealTimers());

  const settle = async (pending: Promise<unknown>) => {
    jest.advanceTimersByTime(MAX_DELAY_MS);
    await pending;
  };

  it('is loading before the mock delay passes, so the list can show its skeletons', async () => {
    const pending = useProperties.getState().load();

    expect(useProperties.getState().loading).toBe(true);

    await settle(pending);

    expect(useProperties.getState().loading).toBe(false);
    expect(useProperties.getState().properties).toEqual(seededProperties);
  });

  it('appends a new property to the list', async () => {
    await settle(useProperties.getState().load());

    await settle(useProperties.getState().add(NEW_PROPERTY));

    const { properties } = useProperties.getState();
    expect(properties).toHaveLength(seededProperties.length + 1);
    expect(properties.at(-1)?.alias).toBe('Beach house');
  });

  it('keeps the added property for the session — a second load does not re-seed over it', async () => {
    await settle(useProperties.getState().load());
    await settle(useProperties.getState().add(NEW_PROPERTY));

    await useProperties.getState().load();

    expect(useProperties.getState().properties).toHaveLength(seededProperties.length + 1);
  });
});
