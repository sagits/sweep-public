import { useRouter } from 'expo-router';

import { Screen } from '@sweep/ui';

import { NewPropertyForm } from '@/properties/NewPropertyForm';
import { useProperties } from '@/stores/useProperties';

export default function NewPropertyScreen() {
  const router = useRouter();
  const add = useProperties((state) => state.add);

  // Deep-linked (the web target's `/property/new`) there is nothing to go back to.
  const close = () => (router.canGoBack() ? router.back() : router.replace('/properties'));

  return (
    <Screen testID="screen.new-property">
      <NewPropertyForm
        onSave={async (input) => {
          await add(input);
          close();
        }}
        onClose={close}
      />
    </Screen>
  );
}
