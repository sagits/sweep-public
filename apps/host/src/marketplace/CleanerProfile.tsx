import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Bid } from '@sweep/types';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, SectionHeader, colors } from '@sweep/ui';

import { SuperCleanerPill } from './BidCard';
import { HowItWorksRow } from './HowItWorksRow';
import { MarketplaceHeader } from './MarketplaceHeader';

/**
 * How much of the cleaner's message shows before the "Show" expander. All three seeded messages
 * are longer than this, so every one of them gets an expander — screenshot `19` shows Ramona's
 * expanded, ending in "Hide".
 */
const MESSAGE_PREVIEW = 150;

/** Truncates on a word boundary, so the preview never ends mid-word. */
export function messagePreview(message: string, limit = MESSAGE_PREVIEW) {
  if (message.length <= limit) return null;
  const cut = message.slice(0, limit);
  const space = cut.lastIndexOf(' ');
  return `${(space > 0 ? cut.slice(0, space) : cut).trimEnd()}… `;
}

const money = (amount: number) =>
  amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/** A hairline between the white card's sections — screenshots `17`/`20` draw one per boundary. */
function Divider() {
  return <View className="h-px bg-border" />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="text-[17px] text-ink">{label}</Text>
      <Text className="text-[17px] text-inkMuted">{value}</Text>
    </View>
  );
}

/** The pinned row under the header: photo, name, chip, rating, expiry, and the chat button. */
function SummaryRow({ bid }: { bid: Bid }) {
  const { cleaner } = bid;

  return (
    <View className="flex-row items-center gap-3 px-3 pb-3">
      <View className="h-[72px] w-[72px] items-center justify-center rounded-sm bg-surfaceMuted">
        <Text className="text-[38px]">{cleaner.photo}</Text>
      </View>

      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-[19px] font-bold text-ink">{cleaner.name}</Text>
          {cleaner.superCleaner ? <SuperCleanerPill /> : null}
        </View>

        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons name="star" size={18} color={colors.star} />
          <Text testID="cleaner.rating" className="text-[15px] font-bold text-ink">
            {cleaner.rating.toFixed(1)}
          </Text>
          {/* One template literal: React Native splits `({n} reviews)` into separate text nodes
              and no `by.text` matcher can reach those. */}
          <Text className="text-[15px] text-ink">{`(${cleaner.reviewCount} reviews)`}</Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons name="clock" size={16} color={colors.inkMuted} />
          <Text className="text-[15px] text-ink">{`Expires in ${bid.expiresInDays} days`}</Text>
        </View>
      </View>

      {/* ponytail: inert, per the PRD — it renders exactly as shown and does nothing on tap. */}
      <Pressable
        testID="cleaner.chat"
        accessibilityRole="button"
        accessibilityLabel={`Chat with ${cleaner.name}`}
        className="h-11 w-11 items-center justify-center rounded-full bg-primary"
      >
        <MaterialCommunityIcons name="forum" size={22} color={colors.surface} />
      </Pressable>
    </View>
  );
}

/**
 * One before/after thumbnail. The work photos are emoji stand-ins, so the reference's stacked
 * BEFORE/AFTER photo pair becomes one tile banded across the middle.
 */
function WorkPhoto({ photo, testID }: { photo: string; testID: string }) {
  return (
    <View className="w-1/3 p-1">
      {/* The band sits between two flex spacers rather than at `top: '50%'`: Fabric silently
          collapses a percentage `top` on an absolutely positioned view to 0. */}
      <View testID={testID} className="aspect-square overflow-hidden rounded bg-surfaceMuted">
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-[34px]">{photo}</Text>
        </View>
        <View className="flex-1" />
        <View className="flex-row justify-center gap-2 bg-ink/70 py-0.5">
          <Text className="text-[9px] font-bold text-white">BEFORE</Text>
          <Text className="text-[9px] font-bold text-primaryMuted">AFTER</Text>
        </View>
        <View className="flex-1" />
      </View>
    </View>
  );
}

/** The bordered price card in the sticky footer, with its "More" expander. */
function PriceCard({ bid }: { bid: Bid }) {
  const [open, setOpen] = useState(false);

  return (
    <View testID="cleaner.price" className="rounded border border-primary bg-surface px-3 py-3">
      <View className="flex-row items-center">
        <View className="flex-1 items-center">
          <Text testID="cleaner.price.amount" className="text-[26px] font-bold text-ink">
            {money(bid.price)}
          </Text>
          <Text className="text-[15px] text-ink">per Project + Fees</Text>
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-[15px] font-bold text-ink">Cleaner Bid</Text>
          <Pressable
            testID="cleaner.price.more"
            accessibilityRole="button"
            onPress={() => setOpen((current) => !current)}
            hitSlop={8}
            className="flex-row items-center gap-1"
          >
            <Text className="text-[15px] text-primary">{open ? 'Less' : 'More'}</Text>
            <MaterialCommunityIcons
              name={open ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </View>

      {/* ponytail: no screenshot shows this open, so it breaks down the "+ Fees" the row names
          and nothing more. */}
      {open ? (
        <View testID="cleaner.price.breakdown" className="gap-1.5 pt-3">
          <Divider />
          <InfoRow label="Cleaner Bid" value={money(bid.price)} />
          <InfoRow label="Fees" value="Added at checkout" />
        </View>
      ) : null}
    </View>
  );
}

/**
 * The cleaner detail screen — screenshots `17`, `18`, `19`, `20`. Read-only: the chat button,
 * "Accept Bid and Add to My Team" and "Reject Bid" all render as shown and do nothing on tap.
 *
 * It takes the bid rather than a cleaner id because the whole `Cleaner` rides on the `Bid`, so
 * nothing here looks anything up; the route hands it in and this file needs no store.
 */
export function CleanerProfile({
  bid,
  propertyAlias,
  onBack,
}: {
  bid: Bid;
  propertyAlias: string;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { cleaner } = bid;
  const [expanded, setExpanded] = useState(false);

  const preview = messagePreview(cleaner.message);

  return (
    <>
      <MarketplaceHeader
        testID="cleaner.header"
        titleTestID="cleaner.title"
        title={propertyAlias}
        onBack={onBack}
      >
        <SummaryRow bid={bid} />
        {cleaner.rentalHandyPro ? (
          <>
            <Divider />
            <View testID="cleaner.handy-pro" className="flex-row items-center gap-2 px-3 py-3">
              <MaterialCommunityIcons name="tools" size={20} color={colors.ink} />
              <Text className="flex-1 text-[17px] font-bold text-ink">
                is also a Rental Handy Pro
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.illustration}
              />
            </View>
          </>
        ) : null}
      </MarketplaceHeader>

      <ScrollView
        testID="cleaner.scroll"
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      >
        <HowItWorksRow
          title="How Adding a Cleaner to My Team Works"
          testID="cleaner.info"
          chevronColor={colors.primary}
        />

        <Card className="mt-3">
          <View testID="cleaner.information" className="gap-1 p-4">
            <SectionHeader title="Information" />
            <View className="pt-1">
              <InfoRow label="Completed Projects" value={`${cleaner.completedProjects}`} />
              <InfoRow label="Location" value={cleaner.location} />
              <InfoRow label="Distance" value={`${cleaner.distanceMiles} miles away`} />
              <InfoRow label="Member Since" value={cleaner.memberSince} />
            </View>
          </View>

          <Divider />

          <View className="gap-2 p-4">
            <SectionHeader title="Message from Cleaner" />
            {/* The whole paragraph toggles, not just the word: Detox reads a nested `Text` as
                part of its parent, so an inline "Show" is no tap target of its own — and for the
                same reason the state is on the label, which Detox can match. The title stays
                outside the pressable so it keeps its own node. */}
            <Pressable
              testID="cleaner.message"
              accessibilityRole="button"
              accessibilityLabel={expanded ? 'Hide message' : 'Show message'}
              onPress={() => setExpanded((current) => !current)}
              className="flex-row gap-2"
            >
              <MaterialCommunityIcons
                name="format-quote-open"
                size={20}
                color={colors.ink}
                style={{ marginTop: 2 }}
              />
              <Text testID="cleaner.message.body" className="flex-1 text-[17px] leading-7 text-ink">
                {preview && !expanded ? preview : `${cleaner.message} `}
                {preview ? (
                  <Text className="text-[17px] text-primaryInk underline">
                    {expanded ? 'Hide' : 'Show'}
                  </Text>
                ) : null}
              </Text>
            </Pressable>
          </View>

          {cleaner.backgroundChecked ? (
            <>
              <Divider />
              <View testID="cleaner.badges" className="gap-2 p-4">
                <SectionHeader title="Badges" />
                <View className="items-center self-start pt-1">
                  <View className="h-16 w-16 items-center justify-center rounded bg-surfaceMuted">
                    <MaterialCommunityIcons
                      name="shield-check-outline"
                      size={40}
                      color={colors.badge}
                    />
                  </View>
                  <Text className="w-[104px] pt-2 text-center text-[15px] text-ink">
                    Background Checked
                  </Text>
                </View>
              </View>
            </>
          ) : null}

          <Divider />

          {/* ponytail: inert. The PoC has no reviews list and the PRD does not ask for one. */}
          <View testID="cleaner.reviews" className="flex-row items-center gap-3 p-4">
            <Text className="text-[19px] font-bold text-ink">Reviews</Text>
            <MaterialCommunityIcons name="star" size={20} color={colors.star} />
            <Text className="flex-1 text-[17px] text-ink">{cleaner.rating.toFixed(1)}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.illustration} />
          </View>

          {cleaner.rentalHandyPro ? (
            <>
              <Divider />
              <View testID="cleaner.rental-handy-pro" className="gap-2 p-4">
                <SectionHeader title="Rental Handy Pro" />
                <View className="flex-row gap-2 pt-1">
                  <MaterialCommunityIcons name="tools" size={20} color={colors.ink} />
                  <Text className="flex-1 text-[17px] text-ink">
                    {`${cleaner.name} can also work on general maintenance tasks if needed`}
                  </Text>
                </View>
              </View>
            </>
          ) : null}

          <Divider />

          <View testID="cleaner.photos" className="gap-2 p-4">
            <SectionHeader title={`Photos of ${cleaner.name}'s work`} />
            <View className="-m-1 flex-row flex-wrap pt-1">
              {cleaner.workPhotos.map((photo, index) => (
                <WorkPhoto
                  key={`${photo}-${index}`}
                  photo={photo}
                  testID={`cleaner.photo.${index}`}
                />
              ))}
            </View>
          </View>
        </Card>
      </ScrollView>

      <View
        testID="cleaner.footer"
        className="gap-2 border-t border-border bg-surface px-3 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <PriceCard bid={bid} />
        {/* Both inert, per the PRD. */}
        <Button testID="cleaner.accept" label="Accept Bid and Add to My Team" />
        <Button testID="cleaner.reject" label="Reject Bid" variant="danger" />
      </View>
    </>
  );
}
