import { Text } from 'react-native';

import { Screen } from '@sweep/ui';

export default function ProjectsScreen() {
  return (
    <Screen testID="screen.projects">
      <Text testID="screen.projects.title" className="p-4 text-2xl font-semibold text-ink">
        Projects
      </Text>
    </Screen>
  );
}
