import { Text, View } from 'react-native';

import { Button, Card, Checkbox } from '@sweep/ui';

/**
 * "Invite a Host and get $100 in Credits" — the blue promo card. Ticking "Don't show this
 * anymore" removes it, and the header's credit pill with it, for the rest of the session.
 *
 * ponytail: flat blue rather than the screenshot's left-to-right gradient. A gradient needs
 * either `expo-linear-gradient` (a native module, so a dev-client rebuild) or RN 0.81's
 * `experimental_backgroundImage`, which react-native-web does not implement. Swap in
 * expo-linear-gradient if the gradient ever matters more than the web target.
 */
export function PromoCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Card testID="home.promo-card" background="bg-accent" className="p-[18px]">
      <View className="flex-row items-center gap-4">
        <Text className="text-[52px]">📣</Text>
        <Text className="flex-1 text-[20px] font-bold text-white">
          Invite a Host and get $100 in Credits
        </Text>
      </View>
      <Text className="mt-5 text-[15px] leading-[23px] text-white">
        Get Credits for every new host who signs up and completes 2 Marketplace cleaning projects.
      </Text>
      <Button
        size="small"
        label="Get $100 Credit"
        variant="white"
        className="mt-5"
        testID="home.promo-cta"
      />
      <View className="mt-4">
        <Checkbox
          label="Don't show this anymore"
          checked={false}
          onChange={onDismiss}
          light
          testID="home.promo-dismiss"
        />
      </View>
    </Card>
  );
}
