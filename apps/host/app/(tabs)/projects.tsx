import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card, Screen, Skeleton, colors } from '@sweep/ui';

import { CalendarStrip } from '@/projects/CalendarStrip';
import { ManualProjectDialog } from '@/projects/ManualProjectDialog';
import { ProjectCard } from '@/projects/ProjectCard';
import { groupByDay, sectionLabel, shortMonthLabel, startOfDay } from '@/projects/days';
import { useRefreshControl } from '@/refresh';
import { useProjects } from '@/stores/useProjects';

function SkeletonSection({ testID }: { testID: string }) {
  return (
    <View testID={testID} className="px-4 pt-7">
      <Skeleton className="h-4 w-1/2" />
      <Card className="mt-4 p-[14px]">
        <View className="flex-row items-center gap-3">
          <Skeleton className="h-[60px] w-[60px] rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </View>
        </View>
      </Card>
    </View>
  );
}

export default function ProjectsScreen() {
  const router = useRouter();
  const projects = useProjects((state) => state.projects);
  const loading = useProjects((state) => state.loading);
  const load = useProjects((state) => state.load);
  const reload = useProjects((state) => state.reload);
  const manualDialogHidden = useProjects((state) => state.manualDialogHidden);
  const hideManualDialog = useProjects((state) => state.hideManualDialog);

  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  const sections = groupByDay(projects, selected);
  const openForm = () => router.navigate('/project/new');

  const stepMonth = (step: -1 | 1) => {
    const next = new Date(selected);
    next.setMonth(next.getMonth() + step);
    setSelected(next);
  };

  // Declared here, not inline in the JSX: a hook must never sit in an attribute that a
  // later refactor could move behind a branch.
  const refreshControl = useRefreshControl(reload, 'projects.pull-refresh');

  return (
    // The header and calendar are white; only the day sections sit on the grey page.
    <Screen testID="screen.projects" surface>
      <View className="flex-row items-center justify-between border-b border-border px-5 py-3">
        <Text testID="projects.title" className="text-[19px] text-ink">
          {shortMonthLabel(selected)}
        </Text>
        <View className="flex-row items-center gap-5">
          <Pressable
            testID="projects.add"
            accessibilityRole="button"
            accessibilityLabel="Add project"
            onPress={() => (manualDialogHidden ? openForm() : setDialogOpen(true))}
            hitSlop={10}
          >
            <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
          </Pressable>
          {/* ponytail: inert. The PoC has no filter sheet and the PRD does not describe one; the
              icon is in the reference, so it renders. */}
          <Pressable
            testID="projects.filter"
            accessibilityRole="button"
            accessibilityLabel="Filter projects"
            hitSlop={10}
          >
            <MaterialCommunityIcons name="filter" size={22} color={colors.primary} />
          </Pressable>
          <Pressable
            testID="projects.refresh"
            accessibilityRole="button"
            accessibilityLabel="Refresh projects"
            onPress={() => void reload()}
            hitSlop={10}
          >
            <MaterialCommunityIcons name="refresh" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <CalendarStrip selected={selected} onSelect={setSelected} onStepMonth={stepMonth} />

      <ScrollView
        refreshControl={refreshControl}
        testID="projects.scroll"
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {loading ? (
          <View testID="projects.skeleton">
            <SkeletonSection testID="projects.skeleton-section-1" />
            <SkeletonSection testID="projects.skeleton-section-2" />
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.key} testID={`projects.section.${section.key}`} className="px-4 pt-7">
              <Text className="text-[14px] text-inkMuted">{sectionLabel(section.date)}</Text>
              {section.projects.length > 0 ? (
                <View className="mt-4 gap-3">
                  {section.projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onPress={() =>
                        router.navigate({ pathname: '/project/[id]', params: { id: project.id } })
                      }
                      testID={`projects.row.${project.id}`}
                    />
                  ))}
                </View>
              ) : (
                // A day with nothing scheduled still needs to end somewhere, or a run of empty
                // dates reads as one stack of headings. Same horizontal extent as the card.
                <View
                  testID={`projects.empty-day.${section.key}`}
                  className="mt-4 h-px bg-border"
                />
              )}
            </View>
          ))
        )}
      </ScrollView>

      <ManualProjectDialog
        visible={dialogOpen}
        onCreate={() => {
          setDialogOpen(false);
          openForm();
        }}
        onCancel={() => setDialogOpen(false)}
        onHideForever={hideManualDialog}
        testID="projects.manual-dialog"
      />
    </Screen>
  );
}
