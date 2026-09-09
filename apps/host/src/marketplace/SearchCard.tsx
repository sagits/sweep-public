import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CleanerSearch } from '@sweep/types';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, colors } from '@sweep/ui';

const MINUTE = 60_000;

/**
 * "Created a minute ago" under every search row. The seed is created when the bundle loads, so
 * a fresh launch reads exactly like the reference; it stays honest after that.
 */
export function createdLabel(iso: string): string {
  const minutes = Math.floor((Date.now() - Date.parse(iso)) / MINUTE);
  if (minutes < 2) return 'Created a minute ago';
  if (minutes < 60) return `Created ${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Created ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hours / 24);
  return `Created ${days} ${days === 1 ? 'day' : 'days'} ago`;
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
        className="flex-row items-center gap-3 px-4 py-4"
      >
        <MaterialCommunityIcons name="home-outline" size={44} color={colors.illustration} />
        <View className="flex-1">
          <Text className="text-[20px] font-bold text-ink">{search.propertyAlias}</Text>
          <View className="flex-row items-center gap-2 pt-2">
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.inkMuted} />
            <Text className="text-[15px] text-ink">{createdLabel(search.createdAt)}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={26} color={colors.illustration} />
      </Pressable>

      <View className="h-px bg-border" />

      <Pressable
        testID={`${testID}.summary`}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((was) => !was)}
        className="flex-row items-center gap-1 px-4 py-3"
      >
        <Text className="text-[17px] text-primaryInk">Search Summary</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={colors.primaryInk}
        />
      </Pressable>

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
