import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Screen, Spinner } from '@sweep/ui';

import { NewSearchWizard, SEARCHING_MS } from '@/marketplace/NewSearchWizard';
import { useMarketplace } from '@/stores/useMarketplace';
import { useProperties } from '@/stores/useProperties';

export default function NewSearchScreen() {
  const router = useRouter();
  const properties = useProperties((state) => state.properties);
  const propertiesLoaded = useProperties((state) => state.loaded);
  const loadProperties = useProperties((state) => state.load);
  const post = useMarketplace((state) => state.post);

  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  // Deep-linked (the web target's `/search/new`) there is nothing to go back to.
  const close = () => (router.canGoBack() ? router.back() : router.replace('/marketplace'));

  return (
    <Screen testID="screen.new-search" insetTop={false}>
      {propertiesLoaded ? (
        <NewSearchWizard
          properties={properties}
          onSubmit={async (input) => {
            // The wizard's dialog is up for as long as this takes, so hold it for its full
            // second even though the mock resolver comes back in half of one.
            const [search] = await Promise.all([
              post(input),
              new Promise((done) => setTimeout(done, SEARCHING_MS)),
            ]);
            router.replace(`/search/${search.id}`);
          }}
          onClose={close}
        />
      ) : (
        // The wizard confirms a property's details, so it cannot mount before they arrive.
        <View testID="search-form.loading" className="flex-1 items-center justify-center">
          <Spinner size={48} />
        </View>
      )}
    </Screen>
  );
}
