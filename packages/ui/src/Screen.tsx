import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Page shell every screen sits in: the PRD's light gray background, clear of the status bar and
 * of the sidebar, with content capped and centered so desktop width doesn't stretch edge to edge.
 */
export function Screen({ children, testID }: { children?: ReactNode; testID?: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      className="flex-1 bg-background md:pl-sidebar"
      style={{ paddingTop: insets.top }}
    >
      <View className="w-full max-w-content flex-1 self-center">{children}</View>
    </View>
  );
}
