import { Text, View } from 'react-native';

import { Card, Spinner } from '@sweep/ui';

/** Quality center: a title strip over a spinner that never resolves, exactly as the app ships it. */
export function QualityCenterCard() {
  return (
    <Card testID="home.quality-center-card">
      <View className="bg-surfaceMuted px-[14px] py-[14px]">
        <Text className="text-[19px] font-bold text-ink">Quality center</Text>
      </View>
      <View className="items-center py-9">
        {/* Still, not spinning: see the note on Spinner — a permanent animation blocks
            every Detox spec, not just this screen's. */}
        <Spinner size={32} animating={false} testID="home.quality-center-spinner" />
      </View>
    </Card>
  );
}
