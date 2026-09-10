import type { Payment } from '@sweep/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card, DateTimeStamp, Pill, Skeleton, colors, usd } from '@sweep/ui';

/** Screenshot 22's empty state: a flat gray folder over two lines of bold navy. */
function EmptyHistory() {
  return (
    <View testID="payments.empty" className="items-center px-8 pt-16">
      <MaterialCommunityIcons
        testID="payments.empty-folder"
        name="folder"
        size={128}
        color={colors.illustration}
      />
      <Text className="pt-12 text-center text-[36px] font-bold leading-[44px] text-ink">
        You don&apos;t have any payment history yet.
      </Text>
    </View>
  );
}

function PaymentRow({ payment, first }: { payment: Payment; first: boolean }) {
  return (
    <View
      testID={`payments.row.${payment.id}`}
      className={`flex-row items-center gap-4 py-4 ${first ? '' : 'border-t border-border'}`}
    >
      <View className="flex-1 items-start gap-1">
        <Text className="text-[17px] font-bold text-ink">{payment.cleanerName}</Text>
        <Text className="text-[15px] text-inkMuted">{payment.propertyAlias}</Text>
        <View className="pt-1">
          <Pill label="Paid" testID={`payments.row.${payment.id}.status`} />
        </View>
      </View>
      <View className="items-end gap-1">
        <Text className="text-[19px] font-bold text-ink">{usd(payment.amount)}</Text>
        <DateTimeStamp at={payment.paidAt} testID={`payments.row.${payment.id}.stamp`} />
      </View>
    </View>
  );
}

/** The Payment History body: skeleton rows while the mock resolves, then rows or the empty state. */
export function PaymentList({ payments, loading }: { payments: Payment[]; loading: boolean }) {
  if (loading) {
    return (
      <Card testID="payments.skeleton" className="mx-2 mt-3 gap-4 p-[14px]">
        {[0, 1, 2].map((row) => (
          <View key={row} className="gap-2 py-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </View>
        ))}
      </Card>
    );
  }

  if (payments.length === 0) return <EmptyHistory />;

  return (
    <Card testID="payments.list" className="mx-2 mt-3 px-[14px]">
      {payments.map((payment, index) => (
        <PaymentRow key={payment.id} payment={payment} first={index === 0} />
      ))}
    </Card>
  );
}
