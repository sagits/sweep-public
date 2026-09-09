import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * The teal band at the top of a screen: it clears the status bar itself, so a screen using it
 * passes `insetTop={false}` to `Screen`.
 *
 * `extend` paints more teal *below* the band, behind whatever is rendered next. Home's first
 * cards sit on top of that; the rest of the stack falls onto the page background.
 */
export function HeaderBand({
  children,
  extend = 0,
  testID,
}: {
  children?: ReactNode;
  extend?: number;
  testID?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-primary" style={{ paddingTop: insets.top }}>
      {/* The extension is drawn first so it can never cover the row, and offset by a negative
          `bottom` rather than `top: '100%'`, which Fabric does not resolve. */}
      {extend > 0 ? (
        <View
          className="bg-primary"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -extend,
            height: extend,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {/* testID sits on the row, not the band: `extend` renders outside the band's own bounds,
          and Detox scores an element's visibility over everything its subviews cover. */}
      <View testID={testID} className="h-11 flex-row items-center px-3">
        {children}
      </View>
    </View>
  );
}
