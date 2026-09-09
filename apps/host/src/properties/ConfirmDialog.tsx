import { Pressable, Text, View } from 'react-native';

import { Button } from '@sweep/ui';

/**
 * The "Are you sure?" card from screenshot `29`.
 *
 * A React Native `Alert` would have been less code, but react-native-web makes it a no-op and the
 * PoC's web target has to run the same flow — and the screenshot's dialog is a card of the app's
 * own, not a system alert. It is an absolutely positioned overlay rather than a `Modal` because
 * `Modal` renders nothing under jest-expo, which would put the whole confirm step out of reach of
 * the TDD seam. The overlay fills whatever full-screen view it is rendered into.
 *
 * ponytail: lives here rather than in `packages/ui` while this is the only dialog in the app.
 * Promote it the moment a second feature needs one.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  onConfirm,
  onCancel,
  testID,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  testID: string;
}) {
  if (!visible) return null;

  return (
    <View
      testID={testID}
      className="absolute bottom-0 left-0 right-0 top-0 justify-center bg-ink/40 px-5"
    >
      <View className="rounded-card bg-surface px-5 py-7">
        <Text className="text-center text-[26px] font-semibold text-ink">{title}</Text>
        <Text className="pt-5 text-center text-[17px] leading-6 text-ink">{message}</Text>
        <Button
          label={confirmLabel}
          onPress={onConfirm}
          testID={`${testID}.confirm`}
          className="mt-6"
        />
        <Pressable
          testID={`${testID}.cancel`}
          accessibilityRole="button"
          onPress={onCancel}
          className="mt-3 h-[52px] items-center justify-center rounded-md bg-surfaceMuted"
        >
          <Text className="text-[16px] text-ink">{cancelLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
