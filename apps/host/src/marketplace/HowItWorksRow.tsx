import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Checkbox, colors } from '@sweep/ui';

/**
 * The gray "how this works" strip — ⓘ, title, chevron, and its own "Don't show this message
 * again" tick, which removes it for the rest of the session. The search wizard's step 1 and the
 * cleaner profile draw the same row; only the title and the chevron's colour differ, both
 * sampled off their own reference screenshot.
 */
export function HowItWorksRow({
  title,
  testID,
  chevronColor = colors.illustration,
}: {
  title: string;
  testID: string;
  chevronColor?: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <View testID={testID} className="gap-3 rounded bg-surfaceMuted p-4">
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons name="information" size={20} color={colors.primary} />
        <Text className="flex-1 text-[17px] font-bold text-ink">{title}</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={chevronColor} />
      </View>
      <Checkbox
        label="Don't show this message again"
        checked={false}
        onChange={() => setDismissed(true)}
        testID={`${testID}-dismiss`}
      />
    </View>
  );
}
