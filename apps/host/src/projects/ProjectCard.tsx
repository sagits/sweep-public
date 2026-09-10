import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Project } from '@sweep/types';
import { Pressable, Text, View } from 'react-native';

import { Card, colors, timeLabel } from '@sweep/ui';

import { longDay } from './days';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/** One grey circle from the card's footer strip — the detail screen's status pills, icon only. */
function StatusChip({ icon, color, testID }: { icon: IconName; color: string; testID: string }) {
  return (
    <View
      testID={testID}
      className="h-[26px] w-[26px] items-center justify-center rounded-full bg-background"
    >
      <MaterialCommunityIcons name={icon} size={16} color={color} />
    </View>
  );
}

/** "Wed, Sep 9 2026 • 11:11 AM" — the card's start and end lines. */
const stamp = (iso: string) => `${longDay(new Date(iso))} • ${timeLabel(iso)}`;

/**
 * A project on the calendar's day sections — screenshot `4/30`. Not the same shape as Home's
 * `ProjectRow`: the reference gives the calendar a full card with start and end lines and a
 * strip of status chips, where Home keeps the compact avatar row. They were one component until
 * the reference showed they are two.
 *
 * The mint bar down the left edge is what marks a cleaning project.
 */
export function ProjectCard({
  project,
  onPress,
  testID,
}: {
  project: Project;
  onPress?: () => void;
  testID: string;
}) {
  return (
    <Card testID={testID} className="flex-row">
      <View className="w-[8px] bg-mintBand" />
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="flex-1 px-4 pb-3 pt-4"
      >
        <Text className="text-[16px] font-bold text-ink">{project.propertyAlias}</Text>

        {/* The label is regular and the value bold on one line, so the value is a nested
            `Text`. iOS flattens it into the parent, which keeps the whole line reachable as a
            single `by.text` node — see DECISIONS 06. */}
        <Text className="pt-1.5 text-[14px] text-ink">
          Start: <Text className="font-bold">{stamp(project.startsAt)}</Text>
        </Text>
        <Text className="pt-1 text-[14px] text-ink">
          End: <Text className="font-bold">{stamp(project.endsAt)}</Text>
        </Text>

        <Text className="pt-3 text-[13px] text-ink">
          {`#${project.id} `}
          <Text className="font-bold">No available teammates for this project</Text>
        </Text>

        <View className="flex-row gap-2 pt-3">
          <StatusChip icon="spray-bottle" color={colors.ink} testID={`${testID}.chip.cleaning`} />
          {project.manual ? (
            <StatusChip icon="star" color={colors.violet} testID={`${testID}.chip.manual`} />
          ) : null}
          {project.cleanerName === null ? (
            <StatusChip
              icon="alarm"
              color={colors.ink}
              testID={`${testID}.chip.unassigned`}
            />
          ) : null}
          {project.visible ? (
            <StatusChip icon="eye" color={colors.ink} testID={`${testID}.chip.visible`} />
          ) : null}
          <StatusChip icon="alert" color={colors.danger} testID={`${testID}.chip.no-teammates`} />
        </View>
      </Pressable>
    </Card>
  );
}
