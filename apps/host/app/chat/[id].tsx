import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Screen, Skeleton } from '@sweep/ui';

import { BidStrip, ChatBody, ChatHeader } from '@/messages/Chat';
import { useMarketplace } from '@/stores/useMarketplace';

/** For a deep link that arrives before the seed does — the references show no loading state. */
function LoadingChat() {
  return (
    <View testID="chat.skeleton" className="gap-3 p-3">
      <View className="flex-row items-center gap-3">
        <Skeleton className="h-[60px] w-[60px]" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </View>
      </View>
      <Skeleton className="h-[45px] w-full" />
    </View>
  );
}

/**
 * One conversation, addressed by the **bid** id — the same handle `/cleaner/[id]` uses, and for
 * the same reason: the whole `Cleaner` rides on the `Bid`, and the search the bid belongs to
 * supplies the property alias the strip prints. No lookup, no second store.
 */
export default function ChatScreen() {
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

  const back = () => (router.canGoBack() ? router.back() : router.replace('/messages'));

  // Deep-linked at a bid that is not there. `id` is guarded because the params arrive a render
  // after mount — the same trap the bids list and the cleaner detail hit.
  if (loaded && id && !bid) return <Redirect href="/messages" />;

  return (
    // The header is white and clears the status bar itself, so the page does not inset again.
    <Screen testID="screen.chat" insetTop={false}>
      {bid && search ? (
        <>
          <ChatHeader cleaner={bid.cleaner} onBack={back} />
          <BidStrip
            bid={bid}
            propertyAlias={search.propertyAlias}
            // Straight to the cleaner detail rather than inert: that screen *is* the bid's
            // details, it is addressed by the same id, and the route already exists.
            onDetails={() => router.push({ pathname: '/cleaner/[id]', params: { id: bid.id } })}
          />
          <ChatBody />
        </>
      ) : (
        <LoadingChat />
      )}
    </Screen>
  );
}
