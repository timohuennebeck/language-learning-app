import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { LearningLanguageList } from '@/shared/components/learning-language-list';
import { Button } from '@/shared/ui/button';

/** 03a · Lernsprache (2 von 13). */
export function LearningLanguageStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  return (
    <OnboardingFrame
      step={2}
      title={t('onboarding.learningLanguage.title')}
      sub={t('onboarding.learningLanguage.sub')}
      footer={
        <Button
          height={60}
          size={17.5}
          label={t('onboarding.learningLanguage.cta')}
          onPress={() => router.push('/(onboarding)/goal')}
        />
      }
    >
      <LearningLanguageList
        className="mt-[22px]"
        value={session.learningLanguage}
        onChange={(learningLanguage) => update({ learningLanguage })}
      />
    </OnboardingFrame>
  );
}
