import { propertyImage } from './images';

describe('propertyImage', () => {
  it('resolves a seed key to a bundled asset', () => {
    expect(propertyImage('beach-house')).toBeDefined();
  });

  it('wraps an uploaded base64 photo as a uri source, since there is no server to hold it', () => {
    const dataUri = 'data:image/jpeg;base64,AAAA';

    expect(propertyImage(dataUri)).toEqual({ uri: dataUri });
  });

  it('has nothing for a property with no photo, so the card draws its house outline', () => {
    expect(propertyImage(undefined)).toBeUndefined();
    expect(propertyImage('not-a-key')).toBeUndefined();
  });
});
