import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card, Screen, Skeleton, colors } from '@sweep/ui';

import { BidCard } from '@/marketplace/BidCard';
import { ScreenHeader } from '@/navigation/ScreenHeader';
import { Segmented } from '@/marketplace/Segmented';
import { WhileYouWaitCard } from '@/marketplace/WhileYouWaitCard';
import { useMarketplace } from '@/stores/useMarketplace';

const TABS = ['New cleaner bids', 'Accepted bids'] as const;

const BANNERS = [
  { id: 'payment', label: "You don't have a payment method!" },
  { id: 'calendar', label: 'To add a calendar, select your booking platform' },
];

/** A dismissible strip. The reference shows no close control, so the whole row dismisses it. */
function InfoBanner({ label, testID, onDismiss }: { label: string; testID: string; onDismiss: () => void }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onDismiss}
      className="flex-row items-center gap-3 rounded bg-surfaceMuted px-4 py-4"
    >
      <Text className="flex-1 text-[17px] font-bold text-ink">{label}</Text>
      <MaterialCommunityIcons name="information" size={20} color={colors.primary} />
    </Pressable>
  );
}

function SkeletonBid({ testID }: { testID: string }) {
  return (
    <Card testID={testID} className="flex-row gap-3 p-3">
      <Skeleton className="h-[68px] w-[68px]" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </View>
    </Card>
  );
}

export default function BidsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const loading = useMarketplace((state) => state.loading);
  const loaded = useMarketplace((state) => state.loaded);
  const load = useMarketplace((state) => state.load);
  const search = useMarketplace((state) => state.searches.find((entry) => entry.id === id));

  const [tab, setTab] = useState<string>(TABS[0]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [whileYouWait, setWhileYouWait] = useState(true);

  useEffect(() => {
    void load();
  }, [load]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/marketplace'));

  // Deep-linked at an id that is not there — nothing to show, so fall back to the list.
  // `id` is guarded: the params arrive a render after the screen mounts, and redirecting on that
  // first frame threw away the search the wizard had just posted.
  if (loaded && id && !search) return <Redirect href="/marketplace" />;

  const bids = tab === TABS[0] ? (search?.bids ?? []) : [];
  const banners = BANNERS.filter((banner) => !dismissed.includes(banner.id));

  return (
    <Screen testID="screen.bids" insetTop={false}>
      <ScreenHeader
        title={search?.propertyAlias ?? 'Cleaner bids'}
        titleTestID="bids.title"
        testID="bids.header"
        onBack={close}
        right={
          <Pressable
            testID="bids.close"
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={close}
            hitSlop={10}
            className="h-9 w-9 items-center justify-center rounded-full bg-primary"
          >
            <MaterialCommunityIcons name="close" size={22} color={colors.surface} />
          </Pressable>
        }
      >
        <Segmented options={TABS} value={tab} onChange={setTab} testID="bids.tabs" />
      </ScreenHeader>

      <ScrollView
        testID="bids.scroll"
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      >
        <View className="gap-2">
          {banners.map((banner) => (
            <InfoBanner
              key={banner.id}
              label={banner.label}
              testID={`bids.banner.${banner.id}`}
              onDismiss={() => setDismissed((current) => [...current, banner.id])}
            />
          ))}
        </View>

        <View className="gap-3 pt-4">
          {loading || !search ? (
            <View testID="bids.skeleton" className="gap-3">
              <SkeletonBid testID="bids.skeleton-card-1" />
              <SkeletonBid testID="bids.skeleton-card-2" />
              <SkeletonBid testID="bids.skeleton-card-3" />
            </View>
          ) : bids.length === 0 ? (
            <Text testID="bids.empty" className="py-10 text-center text-[17px] text-ink">
              You haven&apos;t accepted a bid for this search yet.
            </Text>
          ) : (
            bids.map((bid) => (
              <BidCard
                key={bid.id}
                bid={bid}
                onPress={() =>
                  router.push({ pathname: '/cleaner/[id]', params: { id: bid.id } })
                }
              />
            ))
          )}

          {whileYouWait ? <WhileYouWaitCard onDismiss={() => setWhileYouWait(false)} /> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
