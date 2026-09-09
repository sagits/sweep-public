import { Text } from 'react-native';

import { Screen } from '@sweep/ui';

export default function MarketplaceScreen() {
  return (
    <Screen testID="screen.marketplace">
      <Text testID="screen.marketplace.title" className="p-4 text-2xl font-semibold text-ink">
        Marketplace
      </Text>
    </Screen>
  );
}
