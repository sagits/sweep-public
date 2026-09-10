import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CleanerSearch } from '@sweep/types';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, colors, relativeLabel } from '@sweep/ui';

/** "Created a minute ago" under every search row. */
export const createdLabel = (iso: string) => `Created ${relativeLabel(iso)}`;

/**
 * The right of a search's footer, on Home's Cleaner Search card and on the Marketplace list:
 * a teal chip counting the bids, or plain bold "Waiting for Bids" until a cleaner bids.
 *
 * The chip's label is regular weight; only the waiting text is bold. Both come off the
 * reference, and both screens draw the same thing, so it lives in one place.
 */
export function BidCount({
  count,
  testID,
  onPress,
}: {
  count: number;
  testID: string;
  onPress?: () => void;
}) {
  if (count === 0) {
    return (
      <Text testID={`${testID}.waiting`} className="text-[16px] font-bold text-ink">
        Waiting for Bids
      </Text>
    );
  }

  /* A rounded rectangle, not `Pill`: the reference chip is not a full-radius pill. */
  return (
    <Pressable
      testID={`${testID}.bids`}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      className="rounded bg-primary px-4 py-2"
    >
      <Text className="text-[15px] text-white">
        {`${count} ${count === 1 ? 'Bid' : 'Bids'}`}
      </Text>
    </Pressable>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="text-[15px] text-ink">{label}</Text>
      <Text className="text-[15px] text-inkMuted">{value}</Text>
    </View>
  );
}

/** One open search on the Marketplace list — screenshot `21`. */
export function SearchCard({ search, onOpen }: { search: CleanerSearch; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const testID = `marketplace.search.${search.id}`;

  return (
    <Card testID={testID}>
      <Pressable
        testID={`${testID}.open`}
        accessibilityRole="button"
        onPress={onOpen}
        className="px-4 pb-3 pt-3"
      >
        <View className="flex-row items-center gap-3">
          <MaterialCommunityIcons name="home-outline" size={48} color={colors.illustration} />
          <Text className="flex-1 text-[18px] font-bold text-ink">{search.propertyAlias}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.illustration} />
        </View>
        {/* The reference runs the timestamp the full width beneath the row, not indented to the
            alias — the same shape Home's Cleaner Search card already uses. */}
        <View className="flex-row items-center gap-2 pt-1">
          <MaterialCommunityIcons name="clock-outline" size={16} color={colors.inkMuted} />
          <Text className="text-[14px] text-ink">{createdLabel(search.createdAt)}</Text>
        </View>
      </Pressable>

      <View className="h-px bg-border" />

      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          testID={`${testID}.summary`}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((was) => !was)}
          className="flex-row items-center gap-1"
        >
          <Text className="text-[16px] text-primaryInk">Search Summary</Text>
          <MaterialCommunityIcons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={colors.primaryInk}
          />
        </Pressable>
        <BidCount count={search.bids.length} testID={testID} onPress={onOpen} />
      </View>

      {open ? (
        <View testID={`${testID}.summary.body`} className="px-4 pb-4">
          <SummaryRow label="Unit #" value={search.unit === '' ? '—' : search.unit} />
          <SummaryRow label="Bedrooms" value={String(search.bedrooms)} />
          <SummaryRow label="Beds" value={String(search.beds)} />
          <SummaryRow label="Bathrooms" value={String(search.bathrooms)} />
          <SummaryRow
            label="Unit Size"
            value={search.unitSize === null ? '—' : `${search.unitSize} ${search.unitSizeUnit}`}
          />
          <SummaryRow
            label="Cleaning needs"
            value={search.notes === '' ? 'No note added' : search.notes}
          />
        </View>
      ) : null}
    </Card>
  );
}
