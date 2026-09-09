import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { HeaderBand, colors } from '@sweep/ui';

/** Teal painted behind the top of the menu card, measured off screenshot 23. */
const TEAL_BEHIND_CARD = 176;

/**
 * More's teal header: help on the left, settings and logout on the right, then the avatar with
 * its edit badge over the hardcoded name and email. Every control here is decorative in the PoC.
 */
export function MoreHeader({ name, email }: { name: string; email: string }) {
  return (
    <View>
      <HeaderBand testID="more.header">
        <Pressable testID="more.help" hitSlop={8}>
          <MaterialCommunityIcons name="help-circle" size={28} color={colors.surface} />
        </Pressable>
        <View className="flex-1" />
        <Pressable testID="more.settings" className="mr-5" hitSlop={8}>
          <MaterialCommunityIcons name="cog" size={28} color={colors.surface} />
        </Pressable>
        <Pressable testID="more.logout" hitSlop={8}>
          <MaterialCommunityIcons name="logout" size={28} color={colors.surface} />
        </Pressable>
      </HeaderBand>
      <View className="items-center bg-primary px-4 pb-5 pt-3">
        {/* The teal runs on behind the top of the menu card. Drawn first so it stays under the
            avatar, and offset with a negative `bottom` — the one Fabric resolves (DECISIONS 02). */}
        <View
          className="absolute left-0 right-0 bg-primary"
          style={{ bottom: -TEAL_BEHIND_CARD, height: TEAL_BEHIND_CARD, pointerEvents: 'none' }}
        />
        <View
          testID="more.avatar"
          className="h-16 w-16 items-center justify-center rounded-full bg-surfaceMuted"
        >
          <MaterialCommunityIcons name="account" size={44} color={colors.inkMuted} />
          <View
            testID="more.avatar-edit"
            className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center rounded-full bg-surface"
          >
            <MaterialCommunityIcons name="pencil" size={14} color={colors.primaryInk} />
          </View>
        </View>
        <Text testID="more.name" className="mt-2.5 text-[28px] font-bold text-white">
          {name}
        </Text>
        <Text testID="more.email" className="mt-0.5 text-[16px] text-white">
          {email}
        </Text>
      </View>
    </View>
  );
}
