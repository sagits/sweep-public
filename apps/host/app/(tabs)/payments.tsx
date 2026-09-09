import { useEffect } from 'react';
import { ScrollView } from 'react-native';

import { Screen } from '@sweep/ui';

import { PaymentList } from '@/payments/PaymentList';
import { PaymentsHeader } from '@/payments/PaymentsHeader';
import { usePayments } from '@/stores/usePayments';

export default function PaymentsScreen() {
  const payments = usePayments((state) => state.payments);
  const loading = usePayments((state) => state.loading);
  const load = usePayments((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    // The header is white and clears the status bar itself, so the page does not inset again.
    <Screen testID="screen.payments" insetTop={false}>
      <PaymentsHeader />
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
