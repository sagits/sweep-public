import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { CountBadge, HeaderBand, colors } from '@sweep/ui';

/** Teal behind the first two cards. Measured off screenshots 01–03. */
const BAND_EXTEND = 152;

/**
 * Home's teal header: the Sweep wordmark, the dollar icon that opens Payment History, the bell
 * with its unread badge and the messages icon. Payments has no tab of its own; this icon is the
 * way in. The bell and messages icons stay decorative.
 *
 * The reference also carries a blue "Get $100 credit" pill here; it was removed on request.
 */
export function HomeHeader({
  unreadCount,
  onOpenPayments,
}: {
  unreadCount: number;
  onOpenPayments: () => void;
}) {
  return (
    <HeaderBand extend={BAND_EXTEND} testID="home.header">
      <Text testID="home.wordmark" className="text-[28px] font-bold text-white">
        Sweep
      </Text>
      <View className="flex-1" />
      <Pressable
        testID="home.payments"
        accessibilityRole="button"
        accessibilityLabel="Payment history"
        className="mr-5"
        hitSlop={8}
        onPress={onOpenPayments}
      >
        <MaterialCommunityIcons name="currency-usd" size={28} color={colors.surface} />
      </Pressable>
      <Pressable testID="home.bell" className="mr-5" hitSlop={8}>
        <MaterialCommunityIcons name="bell" size={28} color={colors.surface} />
        <View className="absolute -right-2.5 -top-1.5">
          <CountBadge count={unreadCount} testID="home.bell-badge" />
        </View>
      </Pressable>
      <Pressable testID="home.messages" hitSlop={8}>
        <MaterialCommunityIcons name="forum" size={28} color={colors.surface} />
      </Pressable>
    </HeaderBand>
  );
}
