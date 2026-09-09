import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { colors } from '@sweep/ui';

/** Five amber stars, the last partly filled — Ramona's 4.8 draws four full and one half. */
export function StarRating({
  rating,
  size = 20,
  testID,
}: {
  rating: number;
  size?: number;
  testID?: string;
}) {
  return (
    <View testID={testID} className="flex-row" accessibilityLabel={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((slot) => (
        <MaterialCommunityIcons
          key={slot}
          name={rating >= slot ? 'star' : rating >= slot - 0.5 ? 'star-half-full' : 'star-outline'}
          size={size}
          color={colors.star}
        />
      ))}
    </View>
  );
}
