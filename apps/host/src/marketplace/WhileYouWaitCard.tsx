import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card, Checkbox, colors } from '@sweep/ui';

/** Screenshot `16`: two of the five are already done, checked and struck through. */
const ITEMS: { label: string; done: boolean }[] = [
  { label: 'Take a tour', done: true },
  { label: 'Request a Demo', done: false },
  { label: 'Link your Airbnb/PMS', done: false },
  { label: 'Add a payment method', done: false },
  { label: 'Add a checklist to your property', done: true },
];

/** The card under the bid list, dismissed through its own checkbox. */
export function WhileYouWaitCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Card testID="bids.while-you-wait">
      <View className="p-4">
        <Text className="text-[19px] font-bold text-ink">While you wait</Text>
        <Text className="pt-1 text-[15px] text-ink">
          Learn about what happens next with your cleaner search.
        </Text>
      </View>

      <View className="h-px bg-border" />

      <View className="gap-4 p-4">
        {ITEMS.map((item) => (
          <View key={item.label} className="flex-row items-center gap-3">
            {item.done ? (
              <View className="h-7 w-7 items-center justify-center rounded-full bg-primaryDeep">
                <MaterialCommunityIcons name="check" size={18} color={colors.surface} />
              </View>
            ) : (
              <View className="h-7 w-7 rounded-full bg-primary/20" />
            )}
            <Text
              className={`text-[17px] ${
                item.done ? 'text-inkMuted line-through' : 'text-primaryInk'
              }`}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <View className="h-px bg-border" />

      <View className="p-4">
        <Checkbox
          label="Don't show this card again"
          checked={false}
          onChange={onDismiss}
          testID="bids.while-you-wait.dismiss"
        />
      </View>
    </Card>
  );
}
