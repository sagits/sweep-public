import type { Cleaner, CleanerSearch } from '@sweep/types';
import { Pressable, Text, View } from 'react-native';

import { Skeleton } from '@sweep/ui';

import { EmptySearches } from '@/marketplace/EmptySearches';

/** The square emoji avatar, shared with the chat header a message row opens. */
export function CleanerAvatar({ cleaner }: { cleaner: Cleaner }) {
  return (
    <View className="h-[60px] w-[60px] items-center justify-center rounded-sm bg-surfaceMuted">
      <Text className="text-[32px]">{cleaner.photo}</Text>
    </View>
  );
}

function SkeletonRows() {
  return (
    <View testID="messages.skeleton" className="bg-surface px-4">
      {[0, 1, 2].map((row) => (
        <View key={row} className="flex-row gap-3 py-3">
          <Skeleton className="h-[60px] w-[60px]" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * The Messages list — `IMG_0031`. There is no message store and nothing ever sends: every row
 * reads "No messages yet.", so the list is the open searches' bids, flattened.
 *
 * With no bids at all there is nothing to message about, so this shows the Marketplace's own
 * empty state rather than a second set of words for the same situation. That state is only
 * honest once the searches have actually arrived — until then this is a skeleton, or the empty
 * state flashes over bids that are merely still loading.
 */
export function MessageList({
  searches,
  loading,
  onOpen,
}: {
  searches: CleanerSearch[];
  loading: boolean;
  onOpen: (bidId: string) => void;
}) {
  if (loading) return <SkeletonRows />;

  const bids = searches.flatMap((search) => search.bids);

  if (bids.length === 0) return <EmptySearches />;

  return (
    <View testID="messages.list" className="bg-surface">
      {bids.map((bid, index) => (
        <Pressable
          key={bid.id}
          testID={`messages.row.${bid.id}`}
          accessibilityRole="button"
          onPress={() => onOpen(bid.id)}
          className={`flex-row items-center gap-3 px-4 py-3 ${
            index > 0 ? 'border-t border-border' : ''
          }`}
        >
          <CleanerAvatar cleaner={bid.cleaner} />

          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-[19px] font-bold text-ink">{bid.cleaner.name}</Text>
              <Text className="text-[17px] text-primary">Bid Pending</Text>
            </View>
            <Text className="text-[17px] text-ink">No messages yet.</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
