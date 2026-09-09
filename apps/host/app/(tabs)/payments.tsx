import { Text } from 'react-native';

import { Screen } from '@sweep/ui';

export default function PaymentsScreen() {
  return (
    <Screen testID="screen.payments">
      <Text testID="screen.payments.title" className="p-4 text-2xl font-semibold text-ink">
        Payments
      </Text>
    </Screen>
  );
}
