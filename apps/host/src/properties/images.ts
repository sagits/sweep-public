import type { ImageSourcePropType } from 'react-native';

/**
 * `Property.image` is a key, not a path: the mocks stay plain data with no bundler in them, and
 * the `require` calls Metro has to see statically all live here.
 *
 * The photographs are CC0, downloaded into `assets/properties/` rather than hotlinked. Sources
 * and credits are in the README.
 */
const IMAGES: Record<string, ImageSourcePropType> = {
  'beach-house': require('../../assets/properties/beach-house.jpg'),
  'rural-home': require('../../assets/properties/rural-home.jpg'),
  'city-apartment': require('../../assets/properties/city-apartment.jpg'),
};

/**
 * `Property.image` holds one of two things: a key into the bundled seed photographs above, or a
 * `data:` URI for a photo the host picked on the New Property form (there is no server, so an
 * uploaded picture travels inside the property as base64).
 *
 * Undefined for a property with no photo — the card draws its house outline instead.
 */
export function propertyImage(key: string | undefined): ImageSourcePropType | undefined {
  if (!key) return undefined;
  if (key.startsWith('data:')) return { uri: key };
  return IMAGES[key];
}
