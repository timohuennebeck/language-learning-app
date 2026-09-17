import { Redirect } from 'expo-router';

import { useSession } from '@/features/auth/hooks/useSession';
import { SplashScreen } from '@/features/onboarding/components/SplashScreen';

/** Entry: shows the branded splash briefly, then hands off to onboarding or the app. */
export default function Index() {
  const { session } = useSession();
  return (
    <SplashScreen>
      <Redirect href={session.onboardingComplete ? '/(app)' : '/(onboarding)/welcome'} />
    </SplashScreen>
  );
}
