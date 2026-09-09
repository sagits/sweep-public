import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../tokens';

/**
 * The "Don't show this anymore" style checkbox. `light` is the variant that sits on a coloured
 * card, where the box and label are white.
 */
export function Checkbox({
  label,
  checked,
  onChange,
  light = false,
  testID,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  light?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      className="flex-row items-center gap-3"
      hitSlop={8}
    >
      <View
        className={`h-6 w-6 items-center justify-center rounded border-2 ${
          light ? 'border-white' : 'border-border'
        } ${checked ? (light ? 'bg-white' : 'bg-primary') : ''}`}
      >
        {checked ? (
          <MaterialCommunityIcons
            name="check"
            size={16}
            color={light ? colors.accent : colors.surface}
          />
        ) : null}
      </View>
      <Text className={`text-[13px] ${light ? 'text-white' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
