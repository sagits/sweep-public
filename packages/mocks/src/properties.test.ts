import { createProperty, fetchProperties, seededProperties } from './properties';
import { MAX_DELAY_MS, MIN_DELAY_MS } from './resolve';

describe('fetchProperties', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('holds the list back until the mock delay has passed, so the skeletons are observable', async () => {
    let settled = false;
    void fetchProperties().then(() => {
      settled = true;
    });

    jest.advanceTimersByTime(MIN_DELAY_MS - 1);
    await Promise.resolve();
    expect(settled).toBe(false);

    jest.advanceTimersByTime(MAX_DELAY_MS);
    await Promise.resolve();
    expect(settled).toBe(true);
  });

  it('resolves the three seeded properties, each with its own alias, rooms, size and image', async () => {
    const pending = fetchProperties();
    jest.advanceTimersByTime(MAX_DELAY_MS);
    const properties = await pending;

    expect(properties).toHaveLength(3);
    expect(new Set(properties.map((property) => property.alias)).size).toBe(3);
    for (const property of properties) {
      expect(property.address).not.toHaveLength(0);
      expect(property.bedrooms).toBeGreaterThan(0);
      expect(property.beds).toBeGreaterThan(0);
      expect(property.bathrooms).toBeGreaterThan(0);
      expect(property.unitSize).toBeGreaterThan(0);
      expect(property.image).toBeTruthy();
    }
    expect(properties).toEqual(seededProperties);
  });
});

describe('createProperty', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('gives the new property an id of its own and keeps what was filled in', async () => {
    const pending = createProperty({
      alias: 'Beach house',
      address: 'Los Angeles, CA 90001, USA',
      unit: '22',
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
      unitSize: 200,
      unitSizeUnit: 'sq. mt.',
      currency: 'USD',
      checkoutTime: '11:00 am',
      checkinTime: '3:00 pm',
      description: '',
    });
    jest.advanceTimersByTime(MAX_DELAY_MS);
    const created = await pending;

    expect(created.id).toBeTruthy();
    expect(seededProperties.map((property) => property.id)).not.toContain(created.id);
    expect(created.alias).toBe('Beach house');
    expect(created.unitSizeUnit).toBe('sq. mt.');
  });
});
