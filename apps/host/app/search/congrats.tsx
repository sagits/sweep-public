import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, colors } from '@sweep/ui';

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
          className="items-center bg-primary px-6 pb-8"
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
                {/* Blue, not teal: the reference draws these three in the accent blue. */}
                <MaterialCommunityIcons name={step.icon} size={28} color={colors.accent} />
                <Text className="flex-1 text-[17px] leading-[24px] text-ink">{step.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        className="border-t border-border px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button label="Got it!" onPress={goToBids} testID="congrats.got-it" />
      </View>
    </Screen>
  );
}
