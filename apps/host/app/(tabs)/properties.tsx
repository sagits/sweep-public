import { Text } from 'react-native';

import { Screen } from '@sweep/ui';

export default function PropertiesScreen() {
  return (
    <Screen testID="screen.properties">
      <Text testID="screen.properties.title" className="p-4 text-2xl font-semibold text-ink">
        Properties
      </Text>
    </Screen>
  );
}
