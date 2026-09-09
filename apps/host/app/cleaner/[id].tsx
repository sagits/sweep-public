import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Card, Screen, Skeleton } from '@sweep/ui';

import { CleanerProfile } from '@/marketplace/CleanerProfile';
import { MarketplaceHeader } from '@/marketplace/MarketplaceHeader';
import { useMarketplace } from '@/stores/useMarketplace';

/** Skeleton for a deep link that arrives before the seed does — screenshots show no loading state. */
function LoadingProfile() {
  return (
    <>
      <MarketplaceHeader testID="cleaner.header" title="Loading…">
        <View className="flex-row items-center gap-3 px-3 pb-3">
          <Skeleton className="h-[72px] w-[72px]" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </View>
        </View>
      </MarketplaceHeader>
      <View testID="cleaner.skeleton" className="gap-3 p-3">
        <Card className="gap-3 p-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      </View>
    </>
  );
}

/**
 * One cleaner's full profile, addressed by the **bid** id: the whole `Cleaner` rides on the
 * `Bid`, so there is no cleaner lookup and no second store — the search the bid belongs to also
 * supplies the property alias in the header.
 */
export default function CleanerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const loaded = useMarketplace((state) => state.loaded);
  const load = useMarketplace((state) => state.load);
  const searches = useMarketplace((state) => state.searches);

  useEffect(() => {
    void load();
  }, [load]);

  const search = searches.find((entry) => entry.bids.some((bid) => bid.id === id));
  const bid = search?.bids.find((entry) => entry.id === id);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/marketplace'));

  // Deep-linked at a bid that is not there. `id` is guarded because the params arrive a render
  // after mount — the same trap the bids list hit.
  if (loaded && id && !bid) return <Redirect href="/marketplace" />;

  return (
    <Screen testID="screen.cleaner" insetTop={false}>
      {bid && search ? (
        <CleanerProfile bid={bid} propertyAlias={search.propertyAlias} onBack={back} />
      ) : (
        <LoadingProfile />
      )}
    </Screen>
  );
}
