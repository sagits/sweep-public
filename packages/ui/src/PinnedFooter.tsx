import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * A bar pinned under a pushed screen's content — Messages' two buttons, the chat's "I agree"
 * and its composer. A pushed screen has no tab bar to hold the home indicator off, so this
 * clears it the same way `TabBar` does.
 */
export function PinnedFooter({
  children,
  className = 'px-4 pt-3',
}: {
  children?: ReactNode;
  /** Padding and layout. The hairline, the fill and the bottom inset are fixed. */
  className?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`border-t border-border bg-surface ${className}`}
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      {children}
    </View>
  );
}
