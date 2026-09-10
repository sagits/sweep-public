import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, colors } from '@sweep/ui';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * What happens after a search is posted, between the searching dialog and the bids list. The
 * reference names its own app in the third line; ours names this one.
 */
const NEXT_STEPS: { id: string; icon: IconName; text: string }[] = [
  {
    id: 'chat',
    icon: 'account-check',
    text: 'Chat with prospective cleaners using the chat feature.',
  },
  {
    id: 'accept',
    icon: 'message-text',
    text: "Once you agree on a cleaning price, accept the cleaner's bid to start working with them.",
  },
  {
    id: 'notify',
    icon: 'bell-ring',
    text: 'After you accept their bid, your new cleaner will receive notifications about your projects on the Sweep mobile app.',
  },
];

export default function SearchCongratsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Deep-linked with no id there is no bids list to go on to, so the button falls back to the
  // Marketplace rather than routing nowhere.
  const goToBids = () => router.replace(id ? `/search/${id}` : '/marketplace');

  return (
    <Screen testID="screen.search-congrats" insetTop={false} surface>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        <View
          testID="congrats.banner"
          className="items-center bg-congrats px-6 pb-8"
          style={{ paddingTop: insets.top + 24 }}
        >
          <Text className="text-[56px]">🎉</Text>
          <Text testID="congrats.title" className="pt-2 text-[34px] font-bold text-white">
            Congrats!
          </Text>
          <Text className="pt-3 text-center text-[17px] leading-[24px] text-white">
            Your request has been sent to potential cleaners and you should start receiving bids
            soon.
          </Text>
        </View>

        <View className="px-5 pt-7">
          <Text className="text-[22px] font-bold text-ink">Here&rsquo;s what happens next:</Text>
          <View className="gap-5 pt-5">
            {NEXT_STEPS.map((step) => (
              <View key={step.id} testID={`congrats.step.${step.id}`} className="flex-row gap-4">
                {/* The reference draws these in a teal-blue of their own, not the app's teal. */}
                <MaterialCommunityIcons name={step.icon} size={28} color={colors.congratsIcon} />
                <Text className="flex-1 text-[17px] leading-[24px] text-ink">{step.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 40.4pt tall and 9.8pt in from each edge in the reference, in the banner's teal. */}
      <View
        className="border-t border-border px-2.5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {/* Not `Button`: this screen's teal is its own, and passing `bg-congrats` through
            `className` loses to the variant's own `bg-primary` in NativeWind. A one-off colour
            on one screen is not worth a variant in the shared component. */}
        <Pressable
          testID="congrats.got-it"
          accessibilityRole="button"
          onPress={goToBids}
          className="h-[40px] items-center justify-center rounded-md bg-congrats px-4"
        >
          <Text className="text-[16px] text-white">Got it!</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
