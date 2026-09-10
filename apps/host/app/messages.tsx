import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Button, PinnedFooter, Screen, colors } from '@sweep/ui';

import { MessageList } from '@/messages/MessageList';
import { ScreenHeader } from '@/navigation/ScreenHeader';
import { useMarketplace } from '@/stores/useMarketplace';

/**
 * Messages — `IMG_0031`. Reached from the messages icon in Home's header.
 *
 * No store of its own: a conversation in the PoC is a bid, so the open searches are the list.
 * The reference keeps the tab bar visible here; ours pushes outside `(tabs)` like `/payments`,
 * so it does not show.
 */
export default function MessagesScreen() {
  const router = useRouter();
  const searches = useMarketplace((state) => state.searches);
  // `loaded`, not `loading`: until the seed has actually arrived an empty store is "not yet",
  // not "no bids", and the Marketplace empty state would flash over the rows on a cold open.
  const loaded = useMarketplace((state) => state.loaded);
  const load = useMarketplace((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    // The header is white and clears the status bar itself, so the page does not inset again.
    <Screen testID="screen.messages" insetTop={false}>
      <ScreenHeader
        title="Messages"
        titleTestID="messages.title"
        testID="messages.header"
        onBack={() => router.back()}
        right={
          // ponytail: inert, like the Marketplace magnifier — there is nothing to search.
          <Pressable
            testID="messages.search"
            accessibilityRole="button"
            accessibilityLabel="Search messages"
            hitSlop={8}
          >
            <MaterialCommunityIcons name="magnify" size={26} color={colors.primary} />
          </Pressable>
        }
      />
      <ScrollView
        testID="messages.scroll"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <MessageList
          searches={searches}
          loading={!loaded}
          onOpen={(bidId) => router.push({ pathname: '/chat/[id]', params: { id: bidId } })}
        />
      </ScrollView>

      {/* Pinned under the list — the reference floats these above the tab bar. */}
      <PinnedFooter className="gap-3 px-4 pt-3">
        <Button
          label="Find a Cleaner in the Marketplace"
          onPress={() => router.navigate('/marketplace')}
          testID="messages.find-cleaner"
        />
        {/* ponytail: inert, like Home's "Invite Current Teammates" card. */}
        <Button label="Invite Teammates" testID="messages.invite" />
      </PinnedFooter>
    </Screen>
  );
}
