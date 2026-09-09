import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Project } from '@sweep/types';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card, HeaderBand, Screen, Spinner, colors, shadow, timeLabel } from '@sweep/ui';

import { longDay } from './days';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/** The white shadowed chip the screen uses for both the Cleaning band and the status column. */
function StatusPill({
  icon,
  iconColor,
  label,
  testID,
}: {
  icon: IconName;
  iconColor: string;
  label: string;
  testID: string;
}) {
  return (
    <View
      testID={testID}
      className="flex-row items-center gap-2 rounded-full bg-surface px-4 py-2"
      style={shadow.card}
    >
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      <Text className="text-[19px] text-ink">{label}</Text>
    </View>
  );
}

function DetailRow({
  icon,
  iconColor = colors.ink,
  children,
  value,
  valueClassName = 'text-inkMuted',
  chevron = false,
  testID,
}: {
  icon: IconName;
  iconColor?: string;
  children: ReactNode;
  value?: string;
  valueClassName?: string;
  chevron?: boolean;
  testID: string;
}) {
  return (
    <View testID={testID} className="flex-row items-center gap-3 py-4">
      <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
      <View className="flex-1">{children}</View>
      {value ? <Text className={`text-[19px] ${valueClassName}`}>{value}</Text> : null}
      {chevron ? (
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.inkMuted} />
      ) : null}
    </View>
  );
}

const Rule = () => <View className="h-px bg-border" />;

function Header({ id, onBack }: { id: string; onBack: () => void }) {
  return (
    <HeaderBand testID="project.header">
      <Pressable
        testID="project.back"
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        hitSlop={10}
      >
        <MaterialCommunityIcons name="chevron-left" size={30} color={colors.surface} />
      </Pressable>
      <Text testID="project.number" className="flex-1 text-center text-[22px] font-bold text-white">
        Project #{id}
      </Text>
      <Pressable
        testID="project.overflow"
        accessibilityRole="button"
        accessibilityLabel="More"
        hitSlop={10}
      >
        <MaterialCommunityIcons name="dots-horizontal" size={26} color={colors.surface} />
      </Pressable>
    </HeaderBand>
  );
}

/** The full-screen load the PRD asks for: the teal header is already up, the body is a spinner. */
export function ProjectDetailLoading({ id, onBack }: { id: string; onBack: () => void }) {
  return (
    <Screen testID="screen.project-detail" insetTop={false}>
      <Header id={id} onBack={onBack} />
      <View testID="project.loading" className="flex-1 items-center justify-center gap-4">
        <Spinner size={64} testID="project.spinner" />
        <Text className="text-[19px] text-inkMuted">Loading…</Text>
      </View>
    </Screen>
  );
}

/** Project detail, screenshot `09`. */
export function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <Screen testID="screen.project-detail" insetTop={false}>
      <Header id={project.id} onBack={onBack} />
      <ScrollView
        testID="project.scroll"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="items-center bg-primary px-4 pb-5 pt-2">
          <Text testID="project.property" className="text-[26px] font-bold text-white">
            {project.propertyAlias}
          </Text>
          <Text testID="project.assignment" className="pt-1 text-[19px] text-white">
            {project.cleanerName ?? 'Unassigned Project'}
          </Text>
        </View>

        {/* The teal runs on behind the mint band and the top of the times card, which is why the
            strip is absolute rather than a background on this container. */}
        <View className="px-4">
          <View className="absolute left-0 right-0 top-0 h-[90px] bg-primary" />
          <View testID="project.cleaning-band" className="items-center bg-primaryMuted py-2">
            <StatusPill
              icon="spray-bottle"
              iconColor={colors.ink}
              label="Cleaning"
              testID="project.cleaning-pill"
            />
          </View>
          <Card testID="project.times" className="flex-row py-4">
            <View className="flex-1 items-center">
              <Text className="text-[17px] text-inkMuted">Start time</Text>
              <Text testID="project.start-time" className="pt-1 text-[26px] font-bold text-ink">
                {timeLabel(project.startsAt)}
              </Text>
              <Text className="pt-1 text-[15px] text-inkMuted">
                {longDay(new Date(project.startsAt))}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-[17px] text-inkMuted">End time</Text>
              <Text testID="project.end-time" className="pt-1 text-[26px] font-bold text-ink">
                {timeLabel(project.endsAt)}
              </Text>
              <Text className="pt-1 text-[15px] text-inkMuted">
                {longDay(new Date(project.endsAt))}
              </Text>
            </View>
          </Card>
        </View>

        <View testID="project.status-pills" className="items-center gap-2 px-4 pt-6">
          {project.manual ? (
            <StatusPill
              icon="star"
              iconColor={colors.violet}
              label="Manual Project"
              testID="project.pill.manual"
            />
          ) : null}
          {project.cleanerName === null ? (
            <StatusPill
              icon="alert-circle"
              iconColor={colors.warning}
              label="Still Unassigned - Due 24h"
              testID="project.pill.unassigned"
            />
          ) : null}
          {project.visible ? (
            <StatusPill
              icon="eye"
              iconColor={colors.ink}
              label="Visible to teammates"
              testID="project.pill.visible"
            />
          ) : null}
          <StatusPill
            icon="alert"
            iconColor={colors.danger}
            label="No available teammates for this project"
            testID="project.pill.no-teammates"
          />
        </View>

        <Card testID="project.details" className="mx-4 mt-6 px-4">
          <DetailRow icon="refresh" chevron testID="project.row.history">
            <Text className="text-[19px] text-ink">
              Project History: <Text className="font-bold text-primaryInk">Project created</Text>
            </Text>
          </DetailRow>
          <Rule />
          <DetailRow icon="map-marker" testID="project.row.address">
            <Text className="text-[19px] text-ink">{project.propertyAddress}</Text>
          </DetailRow>
          <Rule />
          <DetailRow
            icon="alert"
            iconColor={colors.danger}
            value="0"
            valueClassName="text-primaryInk"
            chevron
            testID="project.row.problems"
          >
            <Text className="text-[19px] text-ink">Property Problems</Text>
          </DetailRow>
          <Rule />
          <DetailRow icon="format-list-checks" value="0/26 done" chevron testID="project.row.checklist">
            <Text className="text-[19px] text-ink">Checklist:</Text>
          </DetailRow>
          <Rule />
          <DetailRow
            icon="paper-roll"
            value="0"
            valueClassName="text-primaryInk"
            chevron
            testID="project.row.inventory"
          >
            <Text className="text-[19px] text-ink">Inventory</Text>
          </DetailRow>
          <Rule />
          <DetailRow icon="clipboard-text" testID="project.row.name">
            <Text className="text-[19px] text-ink">Project: {project.name}</Text>
          </DetailRow>
          <Rule />
          <DetailRow icon="format-list-bulleted" testID="project.row.notes">
            <Text className="text-[19px] text-ink">Private Notes:</Text>
          </DetailRow>
        </Card>
      </ScrollView>
    </Screen>
  );
}
