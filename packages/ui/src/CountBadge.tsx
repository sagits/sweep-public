import { Text, View } from 'react-native';

/** The small red count bubble that rides on the header bell. Renders nothing at zero. */
export function CountBadge({ count, testID }: { count: number; testID?: string }) {
  if (count <= 0) return null;

  return (
    <View
      testID={testID}
      className="min-w-[22px] items-center justify-center rounded-full bg-danger px-1.5 py-0.5"
    >
      <Text className="text-[12px] font-bold text-white">{count}</Text>
    </View>
  );
}
