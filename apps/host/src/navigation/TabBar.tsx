import { colors } from '@sweep/ui';
import { Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// expo-router vendors react-navigation, so the tab bar props come off the navigator
// itself rather than from a @react-navigation/* package.
type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICON_SIZE = 26;

/** `tabs.home`, `tabs.projects`, ... — the index route is Home. Mirrored in `navigation.e2e.ts`. */
function tabTestID(routeName: string) {
  return `tabs.${routeName === 'index' ? 'home' : routeName}`;
}

/**
 * Bottom bar on phones, left sidebar at the `md` breakpoint and above — same source, no second
 * web layout. Active tab is teal with its label showing; inactive tabs are muted teal, no label.
 */
export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="tabs"
      // Breakpoint classes rather than measured dimensions: on web these compile to a real
      // CSS media query, which `useWindowDimensions` does not track in the static export.
      className="flex-row border-t border-border bg-surface md:absolute md:bottom-0 md:left-0 md:top-0 md:w-sidebar md:flex-col md:justify-center md:gap-5 md:border-r md:border-t-0"
      style={{ paddingBottom: insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        if (!descriptor) return null;

        const { options } = descriptor;
        const focused = state.index === index;
        const color = focused ? colors.primary : colors.primaryMuted;
        const testID = tabTestID(route.name);

        return (
          <Pressable
            key={route.key}
            testID={testID}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.title}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            className="flex-1 items-center py-2.5 md:flex-none"
          >
            {options.tabBarIcon?.({ focused, color, size: ICON_SIZE })}
            {focused ? (
              <Text
                testID={`${testID}.label`}
                className="text-primary"
                style={{ fontSize: 12, marginTop: 4 }}
                numberOfLines={1}
              >
                {options.title}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
