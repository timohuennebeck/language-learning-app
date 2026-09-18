import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/hooks/use-session';
import { AppProviders } from '@/shared/components/app-providers';
import { useAppFonts } from '@/shared/hooks/use-app-fonts';
import { colors } from '@/shared/theme/tokens';

import '@/shared/theme/global.css';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: 'index',
};

function RootNavigator() {
  const { status, session } = useSession();
  const { loaded } = useAppFonts();
  const ready = loaded && status === 'ready';

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  const onboarded = session.onboardingComplete;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" />
      {/* Onboarding is only reachable until it has been completed. */}
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      {/* The product itself is gated behind a finished onboarding (later: a Supabase session). */}
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      {/* Development-only screen index for design verification. */}
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="dev" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProviders>
  );
}
