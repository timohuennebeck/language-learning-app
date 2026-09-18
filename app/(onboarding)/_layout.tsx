import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f3f5fe' },
        animation: 'slide_from_right',
      }}
    />
  );
}
