import type { Project } from '@sweep/types';
import { Text, View } from 'react-native';

import { Card, SectionHeader, Skeleton } from '@sweep/ui';

import { ProjectRow } from '@/projects/ProjectRow';

/** Home's Projects card: the same rows the calendar's day sections render, newest day first. */
export function ProjectsCard({
  projects,
  loading,
  onSeeAll,
  onOpen,
}: {
  projects: Project[];
  loading: boolean;
  onSeeAll: () => void;
  onOpen: (project: Project) => void;
}) {
  return (
    <Card testID="home.projects-card" className="p-[14px]">
      <SectionHeader
        title="Projects"
        actionLabel="See all"
        onAction={onSeeAll}
        actionTestID="home.projects-see-all"
      />
      {loading ? (
        <View testID="home.projects-skeleton" className="gap-3 py-6">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      ) : projects.length === 0 ? (
        <Text testID="home.projects-empty" className="py-8 text-center text-[15px] text-ink">
          There are no projects right now.
        </Text>
      ) : (
        projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onPress={() => onOpen(project)}
            testID={`home.project.${project.id}`}
          />
        ))
      )}
    </Card>
  );
}
