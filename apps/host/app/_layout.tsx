import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useSession } from '@/stores/useSession';

// No sign in / sign up — the app boots straight into the logged-in state.
export default function RootLayout() {
  const load = useSession((state) => state.load);

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
