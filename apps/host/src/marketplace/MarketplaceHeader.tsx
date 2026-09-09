import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@sweep/ui';

/**
 * The white header the three Marketplace screens share: an optional teal back chevron on the
 * left, the title centred, icons on the right, and whatever comes next (always the segmented
 * control) still on white, over a hairline.
 *
 * ponytail: local to the feature, not in `packages/ui`. `HeaderBand` is the teal band and
 * centres nothing; ticket 07's `PaymentsHeader` is the same idea but pins its own icons. When a
 * fourth screen wants this shape it can be promoted — three of the four are in this folder.
 */
export function MarketplaceHeader({
  title,
  onBack,
  right,
  children,
  testID,
  titleTestID,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  children?: ReactNode;
  testID?: string;
  titleTestID?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      className="border-b border-border bg-surface"
      style={{ paddingTop: insets.top }}
    >
      <View className="h-12 flex-row items-center px-3">
        <View className="w-12">
          {onBack ? (
            <Pressable
              testID={testID ? `${testID}.back` : undefined}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBack}
              hitSlop={12}
            >
              <MaterialCommunityIcons name="chevron-left" size={34} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
        <Text
          testID={titleTestID}
          numberOfLines={1}
          className="flex-1 text-center text-[18px] font-bold text-ink"
        >
          {title}
        </Text>
        <View className="min-w-12 flex-row items-center justify-end gap-4">{right}</View>
      </View>
      {children}
    </View>
  );
}
