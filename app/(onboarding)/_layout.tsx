import { Stack } from 'expo-router';

import { PlacementProvider } from '@/features/onboarding/lib/placement-store';

export default function OnboardingLayout() {
  return (
    <PlacementProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f3f5fe' },
          animation: 'slide_from_right',
        }}
      />
    </PlacementProvider>
  );
}
