import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CleanerSearch } from '@sweep/types';
import { Pressable, Text, View } from 'react-native';

import { Button, Card, SectionHeader, Skeleton, colors } from '@sweep/ui';

import { createdLabel } from '@/marketplace/SearchCard';

/** One search inside the card: the gray panel of screenshot `03`, with its teal bid chip. */
function SearchRow({ search, onOpen }: { search: CleanerSearch; onOpen: () => void }) {
  const testID = `home.cleaner-search.${search.id}`;

  return (
    <View className="overflow-hidden rounded bg-surfaceMuted">
      <Pressable testID={testID} accessibilityRole="button" onPress={onOpen} className="p-3">
        <View className="flex-row items-center gap-3">
          <MaterialCommunityIcons name="home-outline" size={44} color={colors.illustration} />
          <Text className="flex-1 text-[17px] font-bold text-ink">{search.propertyAlias}</Text>
          <MaterialCommunityIcons name="chevron-right" size={26} color={colors.illustration} />
        </View>
        {/* The reference runs the timestamp the full width beneath the row, not indented to
            the alias. */}
        <View className="flex-row items-center gap-2 pt-2">
          <MaterialCommunityIcons name="clock-outline" size={16} color={colors.inkMuted} />
          <Text className="text-[15px] text-ink">{createdLabel(search.createdAt)}</Text>
        </View>
      </Pressable>

      <View className="h-px bg-border" />

      <View className="flex-row justify-end p-3">
        {search.bids.length === 0 ? (
          // No chip until a cleaner bids — the reference says so in plain bold text.
          <Text testID={`${testID}.waiting`} className="text-[17px] font-bold text-ink">
            Waiting for Bids
          </Text>
        ) : (
          /* A rounded rectangle, not `Pill`: the reference chip is not a full-radius pill. */
          <View testID={`${testID}.bids`} className="rounded bg-primary px-4 py-2">
            <Text className="text-[15px] font-bold text-white">
              {`${search.bids.length} ${search.bids.length === 1 ? 'Bid' : 'Bids'}`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * Home's Cleaner Search card, which replaces the "Search for New Cleaners" prompt as soon as one
 * search exists — screenshot `03`.
 */
export function CleanerSearchCard({
  searches,
  loading,
  onSeeAll,
  onOpenSearch,
  onFindCleaners,
}: {
  searches: CleanerSearch[];
  loading: boolean;
  onSeeAll: () => void;
  onOpenSearch: (id: string) => void;
  onFindCleaners: () => void;
}) {
  return (
    <Card testID="home.cleaner-search-card" className="p-[14px]">
      <SectionHeader
        title={loading ? 'Cleaner Search' : `Cleaner Search (${searches.length})`}
        actionLabel="See all"
        onAction={onSeeAll}
        actionTestID="home.cleaner-search-see-all"
      />

      {loading ? (
        <View testID="home.cleaner-search-skeleton" className="gap-3 py-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      ) : (
        <View className="gap-3 pt-3">
          {searches.map((search) => (
            <SearchRow key={search.id} search={search} onOpen={() => onOpenSearch(search.id)} />
          ))}
        </View>
      )}

      <View className="pt-3">
        <Button
          label="Find new cleaners"
          onPress={onFindCleaners}
          testID="home.find-new-cleaners"
        />
      </View>
    </Card>
  );
}
