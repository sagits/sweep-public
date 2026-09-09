import { Pressable, Text, View } from 'react-native';

/**
 * A card's title row: dark navy title on the left, an optional teal link ("See all") on the right.
 */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
  testID,
  actionTestID,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
  actionTestID?: string;
}) {
  return (
    <View testID={testID} className="flex-row items-center justify-between">
      <Text className="text-[19px] font-bold text-ink">{title}</Text>
      {actionLabel ? (
        <Pressable testID={actionTestID} onPress={onAction} hitSlop={8}>
          <Text className="text-[13px] text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
