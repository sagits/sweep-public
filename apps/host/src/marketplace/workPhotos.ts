import type { ImageSourcePropType } from 'react-native';

/**
 * The interiors every cleaner's work gallery is built from. One shared set rather than a set per
 * cleaner: this is a portfolio demo with three seeded cleaners, and six photographs make the
 * point that the grid holds real work.
 *
 * All CC0, downloaded into `assets/work-photos/` rather than hotlinked. Credits in the README.
 * `require` is static so Metro can see every one of them.
 */
const WORK_PHOTOS: ImageSourcePropType[] = [
  require('../../assets/work-photos/living-room.jpg'),
  require('../../assets/work-photos/kitchen.jpg'),
  require('../../assets/work-photos/bedroom.jpg'),
  require('../../assets/work-photos/dining.jpg'),
  require('../../assets/work-photos/hallway.jpg'),
  require('../../assets/work-photos/dining-view.jpg'),
];

/** Wraps, so a cleaner with more tiles than there are photographs still fills its grid. */
export function workPhoto(index: number): ImageSourcePropType {
  return WORK_PHOTOS[index % WORK_PHOTOS.length] as ImageSourcePropType;
}

export const workPhotoCount = WORK_PHOTOS.length;
