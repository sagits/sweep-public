import { Text } from 'react-native';

import { Screen } from '@sweep/ui';

export default function MoreScreen() {
  return (
    <Screen testID="screen.more">
      <Text testID="screen.more.title" className="p-4 text-2xl font-semibold text-ink">
        More
      </Text>
    </Screen>
  );
}
