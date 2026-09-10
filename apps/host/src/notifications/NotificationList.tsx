import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Notification, NotificationKind } from '@sweep/types';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Skeleton, colors, relativeLabel } from '@sweep/ui';

/** `alert-outline` for the unassigned project, `handshake` for a bid or an invitation. */
const ICONS: Record<NotificationKind, 'alert-outline' | 'handshake'> = {
  alert: 'alert-outline',
  bid: 'handshake',
};

/**
 * One row of `IMG_0030`: a teal rounded-square tile, the message, a relative stamp and a
 * chevron. The row is inert — the chevron is decoration, there is nowhere to go — so it is a
 * `View`, not a `Pressable`.
 */
function NotificationRow({ notification, first }: { notification: Notification; first: boolean }) {
  const testID = `notifications.row.${notification.id}`;

  return (
    <View testID={testID} className={notification.read ? 'bg-surface' : 'bg-mint'}>
      {first ? null : <View className="mx-4 h-px bg-border" />}
      <View className="flex-row items-center gap-4 px-4 py-4">
        <View className="h-[45px] w-[45px] items-center justify-center rounded-lg bg-primary">
          <MaterialCommunityIcons
            name={ICONS[notification.kind]}
            size={26}
            color={colors.surface}
          />
        </View>

        <View className="flex-1 gap-1.5">
          <Text className="text-[17px] leading-[24px] text-ink">{notification.message}</Text>
          <Text testID={`${testID}.stamp`} className="text-[15px] text-inkMuted">
            {relativeLabel(notification.at)}
          </Text>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={26} color={colors.illustration} />
      </View>
    </View>
  );
}

function SkeletonRows() {
  return (
    <View testID="notifications.skeleton" className="bg-surface px-4">
      {[0, 1, 2].map((row) => (
        <View key={row} className="flex-row gap-4 py-4">
          <Skeleton className="h-[45px] w-[45px]" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * The Notifications screen's body — `IMG_0030`: a grey search field over a "Mark all as read"
 * row over the list. The search is local state; it filters on the message and nothing else,
 * which is all the reference offers.
 */
export function NotificationList({
  notifications,
  loading,
  onMarkAllRead,
}: {
  notifications: Notification[];
  loading: boolean;
  onMarkAllRead: () => void;
}) {
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const rows = needle
    ? notifications.filter((notification) => notification.message.toLowerCase().includes(needle))
    : notifications;

  return (
    <>
      <View className="bg-surface px-4 pb-4 pt-3">
        <View className="flex-row items-center gap-3 rounded-lg bg-background px-4 py-3">
          <MaterialCommunityIcons name="magnify" size={24} color={colors.inkMuted} />
          <TextInput
            testID="notifications.search"
            value={query}
            onChangeText={setQuery}
            placeholder="Search notifications"
            placeholderTextColor={colors.inkMuted}
            autoCorrect={false}
            className="flex-1 text-[17px] text-ink"
          />
        </View>
      </View>

      <View className="mt-3 bg-surface">
        <Pressable
          testID="notifications.mark-all-read"
          accessibilityRole="button"
          onPress={onMarkAllRead}
          className="flex-row items-center gap-3 px-4 py-4"
        >
          <MaterialCommunityIcons name="check" size={28} color={colors.primary} />
          <Text className="text-[19px] text-primary">Mark all as read</Text>
        </Pressable>

        {loading ? (
          <SkeletonRows />
        ) : rows.length === 0 ? (
          <Text testID="notifications.empty" className="px-4 py-10 text-center text-[17px] text-ink">
            There are no notifications right now.
          </Text>
        ) : (
          <View testID="notifications.list">
            {rows.map((notification, index) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                first={index === 0}
              />
            ))}
          </View>
        )}
      </View>
    </>
  );
}
