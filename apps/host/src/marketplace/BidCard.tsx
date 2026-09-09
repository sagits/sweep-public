import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Bid } from '@sweep/types';
import { Pressable, Text, View } from 'react-native';

import { Card, colors } from '@sweep/ui';

import { StarRating } from './StarRating';

/**
 * ponytail: local, not `Pill`. The shared pill is a plain rounded label; this one is smaller and
 * carries its own ⓘ, so a size-and-icon variant on a file every other feature imports would buy
 * nothing.
 */
export function SuperCleanerPill() {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-primaryDeep px-2.5 py-1">
      <Text className="text-[13px] font-bold text-white">Super Cleaner</Text>
      <MaterialCommunityIcons name="information" size={13} color={colors.surface} />
    </View>
  );
}

/**
 * One cleaner's bid — screenshots `14`/`15`. `onPress` is what ticket 06 hangs the cleaner
 * detail screen off; until that route exists the card renders exactly as shown and does nothing.
 */
export function BidCard({ bid, onPress }: { bid: Bid; onPress?: () => void }) {
  const { cleaner } = bid;
  const testID = `bid-card.${cleaner.name.toLowerCase()}`;

  return (
    <Card testID={testID}>
      <Pressable
        testID={`${testID}.open`}
        accessibilityRole="button"
        onPress={onPress}
        className="flex-row items-center gap-3 p-3"
      >
        <View className="h-[68px] w-[68px] items-center justify-center rounded-sm bg-surfaceMuted">
          <Text className="text-[36px]">{cleaner.photo}</Text>
        </View>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-[19px] font-bold text-ink">{cleaner.name}</Text>
            {cleaner.superCleaner ? <SuperCleanerPill /> : null}
          </View>

          {cleaner.rentalHandyPro ? (
            <View className="flex-row items-center gap-1.5">
              <MaterialCommunityIcons name="tools" size={15} color={colors.ink} />
              <Text className="text-[14px] font-bold text-ink">is also a Rental Handy Pro</Text>
            </View>
          ) : null}

          <View className="flex-row items-center gap-2">
            <StarRating rating={cleaner.rating} testID={`${testID}.stars`} />
            <Text className="text-[15px] font-bold text-ink">{cleaner.rating.toFixed(1)}</Text>
            {/* One template literal, not an interpolation between words: React Native splits
                `{n} reviews` into separate text nodes, which no `by.text` matcher can reach. */}
            <Text className="text-[15px] text-primaryInk">{`${cleaner.reviewCount} reviews`}</Text>
          </View>

          {/* Two siblings rather than one nested Text: Detox reads a nested Text as one node,
              and the price is what `marketplace.e2e.ts` matches on. */}
          <View className="flex-row items-baseline gap-1.5">
            <Text testID={`${testID}.price`} className="text-[19px] font-bold text-ink">
              {`$${bid.price}`}
            </Text>
            <Text className="text-[17px] text-ink">per project</Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <MaterialCommunityIcons name="message-outline" size={15} color={colors.inkMuted} />
            <Text className="text-[15px] text-ink">Chat to confirm availability</Text>
          </View>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={26} color={colors.illustration} />
      </Pressable>

      <View className="h-px bg-border" />

      <View className="flex-row items-center justify-between px-3 py-2">
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons name="clock-outline" size={18} color={colors.inkMuted} />
          <Text className="text-[15px] text-ink">{`Expires in ${bid.expiresInDays} days`}</Text>
        </View>
        {cleaner.backgroundChecked ? (
          <View
            testID={`${testID}.background-check`}
            className="rounded bg-surfaceMuted p-1.5"
            accessibilityLabel="Background checked"
          >
            <MaterialCommunityIcons name="shield-check-outline" size={26} color={colors.badge} />
          </View>
        ) : null}
      </View>
    </Card>
  );
}
