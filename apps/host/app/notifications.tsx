import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Screen, colors } from '@sweep/ui';

import { ScreenHeader } from '@/navigation/ScreenHeader';
import { NotificationList } from '@/notifications/NotificationList';
import { useRefreshControl } from '@/refresh';
import { useNotifications } from '@/stores/useNotifications';

/**
 * The notifications list — `IMG_0030`. Reached from Home's bell and from anywhere on Home's
 * Notifications card; both land here, so there is one route rather than two.
 *
 * Pushed outside `(tabs)`, like `/payments`, so the tab bar does not show.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotifications((state) => state.notifications);
  const loading = useNotifications((state) => state.loading);
  const load = useNotifications((state) => state.load);
  const reload = useNotifications((state) => state.reload);
  const markAllRead = useNotifications((state) => state.markAllRead);

  useEffect(() => {
    void load();
  }, [load]);

  // Declared here, not inline in the JSX: a hook must never sit in an attribute that a
  // later refactor could move behind a branch.
  const refreshControl = useRefreshControl(reload, 'notifications.refresh');

  return (
    // The header is white and clears the status bar itself, so the page does not inset again.
    <Screen testID="screen.notifications" insetTop={false}>
      <ScreenHeader
        title="Notifications"
        titleTestID="notifications.title"
        testID="notifications.header"
        onBack={() => router.back()}
        right={
          // ponytail: inert, like the Payments filter — the PoC has no notification settings.
          <Pressable
            testID="notifications.settings"
            accessibilityRole="button"
            accessibilityLabel="Notification settings"
            hitSlop={8}
          >
            <MaterialCommunityIcons name="cog" size={26} color={colors.inkMuted} />
          </Pressable>
        }
      />
      <ScrollView
        refreshControl={refreshControl}
        testID="notifications.scroll"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <NotificationList
          notifications={notifications}
          loading={loading}
          onMarkAllRead={markAllRead}
        />
      </ScrollView>
    </Screen>
  );
}
