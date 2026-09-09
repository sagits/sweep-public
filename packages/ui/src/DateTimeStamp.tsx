import { Text, View } from 'react-native';

/** "Sep 9, 2026" over "11:11 AM", right aligned and muted — the right edge of every list row. */
export function DateTimeStamp({ at, testID }: { at: string; testID?: string }) {
  const when = new Date(at);

  return (
    <View testID={testID} className="items-end">
      <Text className="text-[13px] text-inkMuted">
        {when.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </Text>
      <Text className="text-[13px] text-inkMuted">
        {when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </Text>
    </View>
  );
}
