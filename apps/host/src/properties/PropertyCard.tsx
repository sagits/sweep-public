import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { Property } from '@sweep/types';
import { Card, colors } from '@sweep/ui';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function Count({ icon, value }: { icon: IconName; value: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <MaterialCommunityIcons name={icon} size={18} color={colors.ink} />
      <Text className="text-[17px] text-ink">{value}</Text>
    </View>
  );
}

/**
 * One property on the Properties tab, per screenshot `24`: thumbnail, teal alias, the
 * bedroom/bed/bathroom/size row, the address, the teammate line and the round overflow button.
 */
export function PropertyCard({ property }: { property: Property }) {
  const testID = `properties.card.${property.id}`;
  const address = property.unit ? `${property.address} #${property.unit}` : property.address;

  return (
    <Card testID={testID} className="p-[14px]">
      <View className="flex-row items-start justify-between">
        <Text testID={`${testID}.alias`} className="text-[20px] text-primaryInk">
          {property.alias}
        </Text>
        <Pressable
          testID={`${testID}.overflow`}
          accessibilityRole="button"
          accessibilityLabel={`More options for ${property.alias}`}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-primary"
        >
          <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.surface} />
        </Pressable>
      </View>

      <View className="flex-row items-center gap-3 pt-2">
        <View className="h-[68px] w-[76px] items-center justify-center">
          {property.image ? (
            <Text className="text-[40px]">{property.image}</Text>
          ) : (
            <MaterialCommunityIcons name="home-outline" size={56} color={colors.inkMuted} />
          )}
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
            <Count icon="door" value={`${property.bedrooms}`} />
            <Count icon="bed" value={`${property.beds}`} />
            <Count icon="shower" value={`${property.bathrooms}`} />
            {property.unitSize === null ? null : (
              <Count icon="ruler" value={`${property.unitSize} ${property.unitSizeUnit}`} />
            )}
          </View>
          <Text className="text-[15px] text-ink">{address}</Text>
          <Text className="text-[15px] text-ink">
            Teammate: <Text className="text-primaryInk">Add teammates</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
}
