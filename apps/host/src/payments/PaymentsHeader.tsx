import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@sweep/ui';

/**
 * Screenshot 22's header: a white band clearing the status bar, the title centered across the
 * full width, and the filter and search icons pinned to the right in teal.
 *
 * `HeaderBand` is not reused — that one is the teal band, and it centers nothing.
 */
export function PaymentsHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-surface" style={{ paddingTop: insets.top }}>
      <View testID="payments.header" className="h-14 flex-row items-center justify-center px-4">
        <Text testID="payments.title" className="text-[30px] font-bold text-ink">
          Payment History
        </Text>
        <View className="absolute right-4 flex-row items-center gap-5">
          {/* ponytail: inert, like the Projects filter and the Marketplace magnifier. The PoC
              has no filter sheet, and `EXPO_PUBLIC_SEED=false` — not a filter that wipes
              history — is what reaches the empty state. */}
          <Pressable
            testID="payments.filter"
            accessibilityRole="button"
            accessibilityLabel="Filter payments"
            hitSlop={8}
          >
            <MaterialCommunityIcons name="tune-variant" size={30} color={colors.primary} />
          </Pressable>
          <Pressable
            testID="payments.search"
            accessibilityRole="button"
            accessibilityLabel="Search payments"
            hitSlop={8}
          >
            <MaterialCommunityIcons name="magnify" size={30} color={colors.primary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
