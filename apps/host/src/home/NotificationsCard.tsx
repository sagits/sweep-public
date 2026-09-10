import type { Notification } from '@sweep/types';
import { Pressable, Text, View } from 'react-native';

import { Card, DateTimeStamp, SectionHeader, Skeleton } from '@sweep/ui';

/**
 * Home's Notifications card: message on the left, date over time on the right.
 *
 * The whole card opens the notifications list, "See all" included — both lead to the same
 * screen, so the link is a second handle on one action rather than a second destination.
 */
export function NotificationsCard({
  notifications,
  loading,
  onOpen,
}: {
  notifications: Notification[];
  loading: boolean;
  onOpen: () => void;
}) {
  return (
    <Card testID="home.notifications-card">
      <Pressable accessibilityRole="button" onPress={onOpen} className="p-[14px]">
        <SectionHeader
          title="Notifications"
          actionLabel="See all"
          onAction={onOpen}
          actionTestID="home.notifications-see-all"
        />
        {loading ? (
          <View testID="home.notifications-skeleton" className="gap-3 py-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </View>
        ) : notifications.length === 0 ? (
          <Text testID="home.notifications-empty" className="py-8 text-center text-[15px] text-ink">
            There are no notifications right now.
          </Text>
        ) : (
          <View className="mt-4">
            {notifications.map((notification, index) => (
              <View
                key={notification.id}
                testID={`home.notification.${notification.id}`}
                className={`flex-row gap-4 py-4 ${index > 0 ? 'border-t border-border' : ''}`}
              >
                <Text className="flex-1 text-[15px] leading-[22px] text-ink">
                  {notification.message}
                </Text>
                <DateTimeStamp
                  at={notification.at}
                  testID={`home.notification.${notification.id}.stamp`}
                />
              </View>
            ))}
          </View>
        )}
      </Pressable>
    </Card>
  );
}
