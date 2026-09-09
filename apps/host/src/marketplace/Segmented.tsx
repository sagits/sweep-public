import { Pressable, Text, View } from 'react-native';

/**
 * The full-width pair under a Marketplace header: Open / Closed, New cleaner bids / Accepted
 * bids. Teal fill and white label when selected, teal label on white when not, inside one teal
 * border — measured off `10` and `14`.
 *
 * ponytail: not `SegmentedToggle` from the property form. That one is the small unpadded
 * sq. ft. / sq. mt. pair; this one is a full-width bordered control. Sharing them would mean a
 * variant prop on a file ticket 03 owns.
 */
export function Segmented({
  options,
  value,
  onChange,
  testID,
}: {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  testID: string;
}) {
  return (
    <View className="m-3 flex-row overflow-hidden rounded border border-primary">
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            testID={`${testID}.${slug(option)}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            className={`h-11 flex-1 items-center justify-center ${
              selected ? 'bg-primary' : 'bg-surface'
            }`}
          >
            <Text className={`text-[17px] ${selected ? 'text-white' : 'text-primaryInk'}`}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
