import { Pressable, Text } from 'react-native';

import { Card } from '@sweep/ui';

/**
 * The two all-teal cards at the top of Home ("Search for New Cleaners", "Invite Current
 * Teammates"): a centred title over a centred one-line subtitle, both teal, on white.
 */
export function PromptCard({
  title,
  subtitle,
  onPress,
  testID,
}: {
  title: string;
  subtitle: string;
  onPress?: () => void;
  testID?: string;
}) {
  return (
    <Card>
      <Pressable testID={testID} onPress={onPress} className="items-center px-4 py-5">
        <Text className="text-center text-[16px] font-bold text-primaryInk">{title}</Text>
        <Text className="mt-2.5 text-center text-[13px] text-primaryInk">{subtitle}</Text>
      </Pressable>
    </Card>
  );
}
