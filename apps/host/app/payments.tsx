import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Screen, colors } from '@sweep/ui';

import { ScreenHeader } from '@/navigation/ScreenHeader';
import { PaymentList } from '@/payments/PaymentList';
import { usePayments } from '@/stores/usePayments';

/**
 * Payment History. Reached from the dollar icon in Home's header rather than a tab of its own,
 * so it is a pushed screen and wears the same white `ScreenHeader` as the other pushed screens —
 * 18px title, 26px icons — instead of the outsized type ticket 07 measured off screenshot 22.
 */
export default function PaymentsScreen() {
  const router = useRouter();
  const payments = usePayments((state) => state.payments);
  const loading = usePayments((state) => state.loading);
  const load = usePayments((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    // The header is white and clears the status bar itself, so the page does not inset again.
    <Screen testID="screen.payments" insetTop={false}>
      <ScreenHeader
        title="Payment History"
        titleTestID="payments.title"
        testID="payments.header"
        onBack={() => router.back()}
        right={
          <>
            {/* ponytail: inert, like the Projects filter and the Marketplace magnifier. The PoC
                has no filter sheet, and `EXPO_PUBLIC_SEED=false` is what reaches the empty
                state. */}
            <Pressable
              testID="payments.filter"
              accessibilityRole="button"
              accessibilityLabel="Filter payments"
              hitSlop={8}
            >
              <MaterialCommunityIcons name="tune-variant" size={26} color={colors.primary} />
            </Pressable>
            <Pressable
              testID="payments.search"
              accessibilityRole="button"
              accessibilityLabel="Search payments"
              hitSlop={8}
            >
              <MaterialCommunityIcons name="magnify" size={26} color={colors.primary} />
            </Pressable>
          </>
        }
      />
      <ScrollView
        testID="payments.scroll"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <PaymentList payments={payments} loading={loading} />
      </ScrollView>
    </Screen>
  );
}
