import { useRouter } from 'expo-router';

import { LiveCallScreen } from '@/features/live/components/live-call-screen';

/** 07 · Einstufung · the placement call is the regular live call ending in the evaluation. */
export function AssessmentCallStep() {
  const router = useRouter();
  return (
    <LiveCallScreen
      hideBack
      tasksHref="/(onboarding)/assessment-tasks"
      onEnd={() => router.push('/(onboarding)/assessment-evaluating')}
    />
  );
}
