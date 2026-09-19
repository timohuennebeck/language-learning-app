import { useRouter } from 'expo-router';

import { LiveCallScreen } from '@/features/live/components/live-call-screen';

/** 07 · Einstufung · the placement call is the regular live call; the evaluation screen waits for its review. */
export function AssessmentCallStep() {
  const router = useRouter();
  return (
    <LiveCallScreen
      kind="placement"
      hideBack
      tasksHref="/(onboarding)/assessment-tasks"
      onEnd={() => router.replace('/(onboarding)/assessment-evaluating')}
    />
  );
}
