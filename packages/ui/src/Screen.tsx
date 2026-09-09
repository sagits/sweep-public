import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Page shell every screen sits in: the PRD's light gray background, clear of the status bar and
 * of the sidebar, with content capped and centered so desktop width doesn't stretch edge to edge.
 *
 * A screen whose own header is a `HeaderBand` passes `insetTop={false}` — the band clears the
 * status bar itself, in teal.
 */
export function Screen({
  children,
  testID,
  insetTop = true,
  surface = false,
}: {
  children?: ReactNode;
  testID?: string;
  insetTop?: boolean;
  /** White page instead of the light gray one, for screens whose cards run edge to edge. */
  surface?: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      className={`flex-1 md:pl-sidebar ${surface ? 'bg-surface' : 'bg-background'}`}
      style={{ paddingTop: insetTop ? insets.top : 0 }}
    >
      <View className="w-full max-w-content flex-1 self-center">{children}</View>
    </View>
  );
}
