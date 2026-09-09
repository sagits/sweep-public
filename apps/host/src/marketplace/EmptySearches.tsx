import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Button, colors } from '@sweep/ui';

const STATS = [
  { figure: '55,000+', label: 'Cleaners Globally' },
  { figure: '4.8M+', label: 'Cleaning Projects Completed' },
];

/**
 * Screenshot `10`. Reached with no searches at all (`EXPO_PUBLIC_SEED=false`) and, since nothing
 * in the PoC ever closes a search, from the Closed tab.
 */
export function EmptySearches({ onFindCleaner }: { onFindCleaner: () => void }) {
  return (
    <View testID="marketplace.empty" className="items-center px-4 pt-16">
      <MaterialCommunityIcons name="handshake-outline" size={116} color={colors.illustration} />

      <Text className="pt-8 text-center text-[22px] font-bold leading-8 text-ink">
        Find a New Cleaner on the Sweep Marketplace
      </Text>
      <Text className="pt-4 text-center text-[15px] leading-6 text-ink">
        Connect and get bids from trusted cleaners in your area and manage all your cleaning
        projects in one place.
      </Text>

      <View className="w-full flex-row pt-8">
        {STATS.map((stat) => (
          <View key={stat.figure} className="flex-1 items-center px-2">
            <Text className="text-[26px] font-bold text-ink">{stat.figure}</Text>
            <Text className="pt-2 text-center text-[15px] text-ink">{stat.label}</Text>
          </View>
        ))}
      </View>

      <View className="w-full pt-8">
        <Button
          label="Find Your Next Cleaner"
          onPress={onFindCleaner}
          testID="marketplace.find-cleaner"
        />
      </View>
    </View>
  );
}
