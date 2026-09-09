import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { Screen } from '@sweep/ui';

import { NewManualProjectForm } from '@/projects/NewManualProjectForm';
import { useProjects } from '@/stores/useProjects';
import { useProperties } from '@/stores/useProperties';

export default function NewProjectScreen() {
  const router = useRouter();
  const properties = useProperties((state) => state.properties);
  const loadProperties = useProperties((state) => state.load);
  const add = useProjects((state) => state.add);

  // The picker lists whatever is registered, including a property added through the Properties
  // tab this session — the store is a no-op once it has loaded.
  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  return (
    // The form's own header is white, so the page is too and only the fields sit on grey.
    <Screen testID="screen.new-project" surface>
      <NewManualProjectForm
        properties={properties}
        onCreate={async (input) => {
          await add(input);
          // The PRD lands the host back on Home, with the new project in the Projects card.
          router.replace('/');
        }}
        onCancel={() => (router.canGoBack() ? router.back() : router.replace('/projects'))}
      />
    </Screen>
  );
}
