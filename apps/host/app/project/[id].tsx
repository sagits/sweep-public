import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Screen } from '@sweep/ui';

import { ProjectDetail, ProjectDetailLoading } from '@/projects/ProjectDetail';
import { useProjects } from '@/stores/useProjects';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const project = useProjects((state) => state.projects.find((one) => one.id === id));
  const loaded = useProjects((state) => state.loaded);
  const load = useProjects((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  // Deep-linked (the web target's `/project/:id`) there is nothing to go back to.
  const back = () => (router.canGoBack() ? router.back() : router.replace('/projects'));

  if (project) return <ProjectDetail project={project} onBack={back} />;
  // The seed is still in flight: the teal header is already up, the body is a spinner.
  if (!loaded) return <ProjectDetailLoading id={id ?? ''} onBack={back} />;

  return (
    <Screen testID="screen.project-detail">
      <View className="flex-1 items-center justify-center px-6">
        <Text testID="project.missing" className="text-center text-[19px] text-ink">
          This project no longer exists.
        </Text>
      </View>
    </Screen>
  );
}
