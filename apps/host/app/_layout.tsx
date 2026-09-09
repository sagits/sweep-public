import '../global.css';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useSession } from '@/stores/useSession';

// No sign in / sign up — the app boots straight into the logged-in state.
export default function RootLayout() {
  const load = useSession((state) => state.load);

  // The icon font has to be registered here, above every screen. `@expo/vector-icons` renders an
  // empty `<Text/>` until `Font.isLoaded` is true, so without this the static web export prerenders
  // every icon as an empty node while the browser — which already has the font from the exported
  // stylesheet — draws the glyph, and React reports a hydration mismatch on load. On web
  // `useFonts` registers synchronously during the server render; on native it is a no-op the icons
  // were already doing for themselves.
  useFonts(MaterialCommunityIcons.font);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
