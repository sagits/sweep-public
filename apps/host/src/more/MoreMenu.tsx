import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { Card, colors } from '@sweep/ui';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/** The ten rows of screenshot 23, in order. */
const ITEMS: { id: string; label: string; icon: IconName }[] = [
  { id: 'properties', label: 'Properties', icon: 'domain' },
  { id: 'property-problems', label: 'Property Problems', icon: 'alert' },
  { id: 'quality-center', label: 'Quality center', icon: 'star' },
  { id: 'checklists', label: 'Checklists', icon: 'clipboard-list' },
  { id: 'inventories', label: 'Inventories', icon: 'paper-roll' },
  { id: 'my-teammates', label: 'My Teammates', icon: 'account-group' },
  { id: 'my-co-hosts', label: 'My co-hosts', icon: 'account-group' },
  { id: 'guest-checkout-feedback', label: 'Guest Checkout Feedback', icon: 'star-half-full' },
  { id: 'guest-center', label: 'Guest Center', icon: 'star-half-full' },
  { id: 'host-services', label: 'Host Services', icon: 'chart-line' },
];

/**
 * The white menu card. Every row renders and every row is inert except Properties, which is the
 * only one the PoC has a destination for.
 */
export function MoreMenu({ onOpenProperties }: { onOpenProperties: () => void }) {
  return (
    <Card testID="more.menu" className="mx-2 py-2">
      {ITEMS.map((item) => (
        <Pressable
          key={item.id}
          testID={`more.row.${item.id}`}
          onPress={item.id === 'properties' ? onOpenProperties : undefined}
          className="h-12 flex-row items-center px-4"
        >
          <MaterialCommunityIcons name={item.icon} size={26} color={colors.ink} />
          <Text className="ml-3.5 text-[17px] text-ink">{item.label}</Text>
        </Pressable>
      ))}
    </Card>
  );
}
