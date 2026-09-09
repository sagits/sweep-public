import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Project } from '@sweep/types';
import { Pressable, Text, View } from 'react-native';

import { DateTimeStamp, colors } from '@sweep/ui';

/**
 * One project row: avatar placeholder, cleaner name or "Unassigned" over the property alias, and
 * the date-over-time stamp on the right. Home's Projects card and the calendar's day sections
 * render the same row, so there is one of these rather than two that drift.
 */
export function ProjectRow({
  project,
  onPress,
  testID,
}: {
  project: Project;
  onPress?: () => void;
  testID: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 py-3"
    >
      <View className="h-[60px] w-[60px] items-center justify-center rounded-full bg-skeleton">
        <MaterialCommunityIcons name="account" size={38} color={colors.illustration} />
      </View>
      <View className="flex-1">
        <Text className="text-[17px] font-bold text-ink">
          {project.cleanerName ?? 'Unassigned'}
        </Text>
        <Text className="pt-1 text-[17px] text-ink">{project.propertyAlias}</Text>
      </View>
      <DateTimeStamp at={project.startsAt} testID={`${testID}.stamp`} />
    </Pressable>
  );
}
