import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';

import { currentUser } from '@sweep/mocks';
import { Screen } from '@sweep/ui';

import { MoreHeader } from '@/more/MoreHeader';
import { MoreMenu } from '@/more/MoreMenu';

/** The version in screenshot 23's footer. Nothing in the PoC bumps it. */
const VERSION = 'v1.44.3';

export default function MoreScreen() {
  const router = useRouter();

  return (
    <Screen testID="screen.more" insetTop={false}>
      <MoreHeader name={currentUser.name} email={currentUser.email} />
      <ScrollView
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
