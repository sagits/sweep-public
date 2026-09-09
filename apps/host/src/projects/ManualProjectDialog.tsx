import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Checkbox } from '@sweep/ui';

const BODY =
  'We sync all bookings from your calendar to create projects automatically. Create a manual ' +
  'project to add a project that is not on your calendar.';

/**
 * The alert the calendar's `+` opens, straight off screenshot `05`: two stacked link-style
 * actions separated by hairlines, and a "Don't show this message again" tick under them.
 *
 * ponytail: an absolutely positioned overlay for the same two reasons ticket 03's `ConfirmDialog`
 * is one — `Alert` is a no-op under react-native-web, and `Modal` renders nothing at all under
 * jest-expo. It is not `ConfirmDialog` itself because that dialog is two stacked *buttons* with
 * no checkbox; sharing them would mean a variant flag for every difference.
 */
export function ManualProjectDialog({
  visible,
  onCreate,
  onCancel,
  onHideForever,
  testID,
}: {
  visible: boolean;
  onCreate: () => void;
  onCancel: () => void;
  /** Called on dismiss when the host ticked the box, so the `+` skips the dialog next time. */
  onHideForever: () => void;
  testID: string;
}) {
  const [hide, setHide] = useState(false);

  if (!visible) return null;

  const dismiss = (done: () => void) => {
    if (hide) onHideForever();
    done();
  };

  return (
    <View
      testID={testID}
      className="absolute bottom-0 left-0 right-0 top-0 justify-center bg-ink/50 px-6"
    >
      <View className="rounded bg-surface">
        <View className="px-5 pb-6 pt-6">
          <Text className="text-center text-[26px] font-bold text-ink">
            Automatic vs. Manual Projects
          </Text>
          <Text className="pt-3 text-center text-[20px] leading-[30px] text-ink">{BODY}</Text>
        </View>
        <View className="h-px bg-border" />
        <Pressable
          testID={`${testID}.create`}
          accessibilityRole="button"
          onPress={() => dismiss(onCreate)}
          className="items-center py-4"
        >
          <Text className="text-[20px] text-primary">Create Manual Project</Text>
        </Pressable>
        <View className="h-px bg-border" />
        <Pressable
          testID={`${testID}.cancel`}
          accessibilityRole="button"
          onPress={() => dismiss(onCancel)}
          className="items-center py-4"
        >
          <Text className="text-[20px] text-inkMuted">Cancel</Text>
        </Pressable>
        <View className="h-px bg-border" />
        <View className="px-5 py-4">
          <Checkbox
            label="Don't show this message again"
            checked={hide}
            onChange={setHide}
            testID={`${testID}.hide`}
          />
        </View>
      </View>
    </View>
  );
}
