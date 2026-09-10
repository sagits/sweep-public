import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { Screen } from '@sweep/ui';

import { MoreHeader } from '@/more/MoreHeader';
import { MoreMenu } from '@/more/MoreMenu';
import { useRefreshControl } from '@/refresh';
import { useSession } from '@/stores/useSession';

/** The version in screenshot 23's footer. Nothing in the PoC bumps it. */
const VERSION = 'v1.44.3';

export default function MoreScreen() {
  const router = useRouter();
  const user = useSession((state) => state.user);
  const load = useSession((state) => state.load);
  const reload = useSession((state) => state.reload);

  useEffect(() => {
    void load();
  }, [load]);

  // Declared here, not inline in the JSX: a hook must never sit in an attribute that a
  // later refactor could move behind a branch.
  const refreshControl = useRefreshControl(reload, 'more.refresh');

  return (
    <Screen testID="screen.more" insetTop={false}>
      <MoreHeader user={user} />
      <ScrollView
        refreshControl={refreshControl}
        testID="more.scroll"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <MoreMenu onOpenProperties={() => router.navigate('/properties')} />
        <Pressable testID="more.check-updates" className="mt-6 items-center">
          <Text className="text-[16px] text-primary">Check for updates</Text>
        </Pressable>
        <Text testID="more.version" className="mt-1 text-center text-[15px] text-ink">
          {VERSION}
        </Text>
      </ScrollView>
    </Screen>
  );
}
