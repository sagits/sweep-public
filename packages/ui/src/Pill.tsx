import { Text, View } from 'react-native';

/** Pill tones seen across the app: the teal "3 Bids" chip and the blue "Get $100 credit" pill. */
const TONES = {
  teal: 'bg-primary',
  blue: 'bg-accent',
} as const;

export type PillTone = keyof typeof TONES;

/**
 * A rounded label chip.
 *
 * Sized off the reference's credit pill: 114.6 x 26.6pt with 10.7pt of text ink, where a 14px
 * bold chip rendered 135 x 31pt with 11.7pt of ink. The Payments "Paid" chip is the only other
 * caller and takes the same size rather than earning a variant of its own.
 */
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
    <View testID={testID} className={`rounded-full px-3 py-1.5 ${TONES[tone]}`}>
      <Text className="text-[13px] font-semibold text-white">{label}</Text>
    </View>
  );
}
