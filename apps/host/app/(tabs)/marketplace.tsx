import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card, Screen, Skeleton, colors } from '@sweep/ui';

import { EmptySearches } from '@/marketplace/EmptySearches';
import { ScreenHeader } from '@/navigation/ScreenHeader';
import { SearchCard } from '@/marketplace/SearchCard';
import { Segmented } from '@/marketplace/Segmented';
import { useRefreshControl } from '@/refresh';
import { useMarketplace } from '@/stores/useMarketplace';

const TABS = ['Open', 'Closed'] as const;

function SkeletonCard({ testID }: { testID: string }) {
  return (
    <Card testID={testID} className="gap-3 p-4">
      <View className="flex-row items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      </View>
      <Skeleton className="h-4 w-1/3" />
    </Card>
  );
}

export default function MarketplaceScreen() {
  const router = useRouter();
  const searches = useMarketplace((state) => state.searches);
  const loading = useMarketplace((state) => state.loading);
  const load = useMarketplace((state) => state.load);
  const reload = useMarketplace((state) => state.reload);
  const [tab, setTab] = useState<string>(TABS[0]);

  useEffect(() => {
    void load();
  }, [load]);

  const newSearch = () => router.navigate('/search/new');
  // Nothing in the PoC ever closes a search, so Closed is always the empty state — which is how
  // the handshake screen stays reachable without disabling the seed.
  const open = tab === TABS[0];
  const listed = open ? searches : [];

  return (
    <Screen testID="screen.marketplace" insetTop={false}>
      <ScreenHeader
        title="Marketplace searches"
        titleTestID="marketplace.title"
        testID="marketplace.header"
        right={
          <>
            {/* ponytail: inert. The reference has no search field behind this icon, and the
                empty state is already reachable through the Closed tab. */}
            <Pressable testID="marketplace.search" accessibilityRole="button" hitSlop={10}>
              <MaterialCommunityIcons name="magnify" size={28} color={colors.primary} />
            </Pressable>
            <Pressable
              testID="marketplace.new"
              accessibilityRole="button"
              accessibilityLabel="New cleaner search"
              onPress={newSearch}
              hitSlop={10}
            >
              <MaterialCommunityIcons name="plus" size={30} color={colors.primary} />
            </Pressable>
          </>
        }
      >
        <Segmented options={TABS} value={tab} onChange={setTab} testID="marketplace.tabs" />
      </ScreenHeader>

      <ScrollView
        refreshControl={useRefreshControl(reload, 'marketplace.refresh')}
        testID="marketplace.scroll"
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      >
        {loading ? (
          <View testID="marketplace.skeleton" className="gap-3">
            <SkeletonCard testID="marketplace.skeleton-card-1" />
            <SkeletonCard testID="marketplace.skeleton-card-2" />
            <SkeletonCard testID="marketplace.skeleton-card-3" />
          </View>
        ) : listed.length === 0 ? (
          <EmptySearches onFindCleaner={newSearch} />
        ) : (
          <View className="gap-3">
            <Text testID="marketplace.count" className="text-[15px] text-ink">
              {listed.length === 1
                ? 'You currently have 1 open search.'
                : `You currently have ${listed.length} open searches.`}
            </Text>
            {listed.map((search) => (
              <SearchCard
                key={search.id}
                search={search}
                onOpen={() => router.navigate(`/search/${search.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
