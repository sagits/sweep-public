import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Bid, Cleaner } from '@sweep/types';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, PinnedFooter, colors, usd } from '@sweep/ui';

import { CleanerAvatar } from './MessageList';

/**
 * The chat behind a message row — `IMG_0032` and `IMG_0033`. Nothing here is really a chat:
 * there is no message store, no thread and no sending, so the screen is its two reference
 * states and the composer never has to work.
 */

/**
 * There is no presence in the PoC and nothing to compute one from, so the reference's own line
 * is a constant rather than an invented timestamp.
 */
const LAST_SEEN = 'Last seen Yesterday, 11:36 PM';

/** Back chevron, square avatar, name over "Last seen …" — left aligned, unlike `ScreenHeader`. */
export function ChatHeader({ cleaner, onBack }: { cleaner: Cleaner; onBack: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View testID="chat.header" className="bg-surface" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-2 px-3 pb-2 pt-2">
        <Pressable
          testID="chat.header.back"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="chevron-left" size={34} color={colors.primary} />
        </Pressable>

        <CleanerAvatar cleaner={cleaner} />

        <View className="flex-1 gap-0.5">
          <Text className="text-[19px] font-bold text-ink">{cleaner.name}</Text>
          <Text className="text-[17px] text-inkMuted">{LAST_SEEN}</Text>
        </View>
      </View>
    </View>
  );
}

/** Property, price and expiry over the "Bid Details" button — the strip under the header. */
export function BidStrip({
  bid,
  propertyAlias,
  onDetails,
}: {
  bid: Bid;
  propertyAlias: string;
  onDetails: () => void;
}) {
  return (
    <View className="bg-surface px-4 pb-2">
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons name="map-marker" size={22} color={colors.ink} />
        <Text className="text-[19px] font-bold text-ink">{propertyAlias}</Text>
      </View>

      <View className="flex-row items-center gap-2 pt-1">
        <MaterialCommunityIcons name="cash" size={22} color={colors.ink} />
        {/* One template literal: React Native splits `{price} per project` into separate text
            nodes, which no `by.text` matcher can reach.

            Sized, not `flex-1`: a growing price box measures against the expiry beside it and
            wrapped "per project" onto a second line, which pushed the card below the fold.

            Two points down from the alias above, and the expiry two down again: the reference
            sets this row in a narrower typeface than the system one, and at matching sizes the
            price and the expiry do not both fit across 390pt. */}
        <Text className="text-[17px] font-bold text-ink">
          {`${usd(bid.price)} per project`}
        </Text>
        <View className="flex-1" />
        <Text className="text-[15px] text-ink">Bid expires in:</Text>
        {/* `Bid` counts days, not hours — the same wording `BidCard` prints. */}
        <Text testID="chat.expiry" className="text-[15px] font-bold text-danger">
          {`${bid.expiresInDays} days`}
        </Text>
      </View>

      <Button
        label="Bid Details"
        onPress={onDetails}
        testID="chat.bid-details"
        className="mt-2"
      />
    </View>
  );
}

const RULES = [
  {
    icon: 'check-circle',
    color: colors.primary,
    title: 'Ask questions',
    body: 'Need clarification? Ask the cleaner questions about their bid.',
  },
  {
    icon: 'cancel',
    color: colors.danger,
    title: "Don't share contact information",
    body: (
      <>
        It is against our{' '}
        {/* ponytail: underlined and inert — the PoC ships no Terms page. */}
        <Text className="underline">Terms of Service</Text> to meet with the cleaner or exchange
        contact information before accepting their bid.
      </>
    ),
  },
  {
    icon: 'check-circle',
    color: colors.primary,
    title: "Accept the cleaner's bid",
    body: 'Accepting a bid is risk free and you can remove the cleaner from your team at any time.',
  },
] as const;

function Rule({ rule }: { rule: (typeof RULES)[number] }) {
  return (
    <View className="pt-5">
      <View className="flex-row items-center gap-3">
        <MaterialCommunityIcons name={rule.icon} size={26} color={rule.color} />
        <Text className="flex-1 text-[19px] font-bold text-ink">{rule.title}</Text>
      </View>
      <Text className="pt-2 text-[17px] leading-[26px] text-ink">{rule.body}</Text>
    </View>
  );
}

/** `IMG_0032`'s white card, plus the blue line under it. */
function ChatRules() {
  return (
    <>
      <Card className="px-5 pb-6 pt-5">
        <Text className="text-[24px] font-bold text-ink">How to use our chat</Text>
        {RULES.map((rule) => (
          <Rule key={rule.title} rule={rule} />
        ))}
      </Card>

      <View className="flex-row items-start gap-2 px-2 pt-4">
        <MaterialCommunityIcons name="information" size={20} color={colors.accent} />
        <Text className="flex-1 text-center text-[17px] leading-[24px] text-accent">
          This chat is monitored by our Customer Support team for quality assurance.
        </Text>
      </View>
    </>
  );
}

/** `IMG_0033`'s orange card. The button is inert — the PoC has no account setup to run. */
function SetUpAccountCard() {
  return (
    <Card background="bg-warning" className="px-5 pb-5 pt-5">
      <View className="flex-row items-center gap-3">
        <MaterialCommunityIcons name="alert-outline" size={30} color={colors.surface} />
        <Text className="flex-1 text-[24px] font-bold text-white">
          Finish setting up your account
        </Text>
      </View>
      <Text className="pt-3 text-[17px] leading-[26px] text-white">
        You need to finish setting up your account prior to chatting to make sure you are serious
        about your search.
      </Text>
      <Pressable
        testID="chat.setup-account"
        accessibilityRole="button"
        className="mt-4 h-[50px] items-center justify-center rounded bg-white/30"
      >
        <Text className="text-[19px] text-white">Set up my account</Text>
      </Pressable>
    </Card>
  );
}

/** The disabled composer `IMG_0033` puts at the bottom. Nothing sends; nothing ever will. */
function Composer() {
  return (
    <PinnedFooter className="flex-row items-center gap-2 px-3 pt-3">
      <TextInput
        testID="chat.composer"
        editable={false}
        multiline
        placeholder="Please finish setting up your account to chat with this cleaner"
        placeholderTextColor={colors.inkMuted}
        className="flex-1 rounded bg-background px-4 py-3 text-[17px] text-ink"
      />
      <MaterialCommunityIcons name="send-variant-outline" size={30} color={colors.illustration} />
    </PinnedFooter>
  );
}

/**
 * The body under the bid strip: the chat rules until the host agrees to them, then the
 * account-setup block and the composer.
 *
 * The agreement is per-conversation and in-memory — it lives here, so leaving the screen and
 * coming back may well show the rules again. Nothing persists, which is what the ticket asked
 * for.
 */
export function ChatBody() {
  const [agreed, setAgreed] = useState(false);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        testID="chat.scroll"
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      >
        {agreed ? <SetUpAccountCard /> : <ChatRules />}
      </ScrollView>

      {agreed ? (
        <Composer />
      ) : (
        <PinnedFooter>
          <Button label="I agree" onPress={() => setAgreed(true)} testID="chat.agree" />
        </PinnedFooter>
      )}
    </View>
  );
}
