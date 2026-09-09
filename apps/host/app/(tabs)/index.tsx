import { Text } from 'react-native';

import { Screen } from '@sweep/ui';

export default function HomeScreen() {
  return (
    <Screen testID="screen.home">
      <Text testID="screen.home.title" className="p-4 text-2xl font-semibold text-ink">
        Home
      </Text>
    </Screen>
  );
}
