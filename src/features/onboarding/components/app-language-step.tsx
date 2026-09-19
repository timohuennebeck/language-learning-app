import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { AppLanguageList } from '@/shared/components/app-language-list';
import { Button } from '@/shared/ui/button';

/** 03 · App-Sprache (1 von 13). */
export function AppLanguageStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  return (
    <OnboardingFrame
      step={1}
      title={t('onboarding.appLanguage.title')}
      sub={t('onboarding.appLanguage.sub')}
      footer={
        <Button
          height={60}
          size={17.5}
          label={t('common.next')}
          onPress={() => router.push('/(onboarding)/learning-language')}
        />
      }
    >
      <AppLanguageList
        className="mt-[22px]"
        value={session.appLanguage}
        onChange={(appLanguage) => update({ appLanguage })}
      />
    </OnboardingFrame>
  );
}
