import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { TabBar } from '@/navigation/TabBar';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const icon = (name: IconName) => {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <MaterialCommunityIcons name={name} color={color} size={size} />;
  }
  return TabIcon;
};

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen
        name="projects"
        options={{ title: 'Projects', tabBarIcon: icon('calendar') }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{ title: 'Marketplace', tabBarIcon: icon('handshake') }}
      />
      <Tabs.Screen
        name="payments"
        options={{ title: 'Payments', tabBarIcon: icon('credit-card') }}
      />
      <Tabs.Screen
        name="properties"
        options={{ title: 'Properties', tabBarIcon: icon('office-building') }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More', tabBarIcon: icon('dots-horizontal') }}
      />
    </Tabs>
  );
}
