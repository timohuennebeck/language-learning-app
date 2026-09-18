import { Stack } from 'expo-router';

import { PlacementProvider } from '@/features/onboarding/lib/placement-store';
import { colors } from '@/shared/theme/tokens';
export default function OnboardingLayout() {
  return (
    <PlacementProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      />
    </PlacementProvider>
  );
}
