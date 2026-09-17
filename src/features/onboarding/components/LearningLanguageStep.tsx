import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { OnboardingFrame } from '@/features/onboarding/components/OnboardingFrame';
import { LearningLanguageList } from '@/shared/components/LearningLanguageList';
import { Button } from '@/shared/ui/Button';

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
      <View className="mt-[22px]">
        <LearningLanguageList
          value={session.learningLanguage}
          onChange={(learningLanguage) => update({ learningLanguage })}
        />
      </View>
    </OnboardingFrame>
  );
}
