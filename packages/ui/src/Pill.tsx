import { Text, View } from 'react-native';

/** Pill tones seen across the app: the teal "3 Bids" chip and the blue "Get $100 credit" pill. */
const TONES = {
  teal: 'bg-primary',
  blue: 'bg-accent',
} as const;

export type PillTone = keyof typeof TONES;

/** A rounded label chip. */
export function Pill({
  label,
  tone = 'teal',
  testID,
}: {
  label: string;
  tone?: PillTone;
  testID?: string;
}) {
  return (
    <View testID={testID} className={`rounded-full px-4 py-2 ${TONES[tone]}`}>
      <Text className="text-[14px] font-bold text-white">{label}</Text>
    </View>
  );
}
