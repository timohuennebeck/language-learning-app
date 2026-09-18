import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { DailyGoalOptions } from '@/shared/components/daily-goal';
import { Button, TextButton } from '@/shared/ui/button';

/** 09h · Tägliche Lernzeit (9 von 13). */
export function DailyGoalStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const next = () => router.push('/(onboarding)/prognosis');
  return (
    <OnboardingFrame
      step={14}
      title={t('onboarding.dailyGoal.title', { name: session.name })}
      sub={t('onboarding.dailyGoal.sub')}
      footer={
        <>
          <Button
            height={60}
            size={17.5}
            label={t('onboarding.dailyGoal.cta', { min: session.dailyGoalMinutes })}
            onPress={next}
          />
          <TextButton className="mt-[16px]" label={t('common.decideLater')} onPress={next} />
        </>
      }
    >
      <DailyGoalOptions
        className="mt-[24px]"
        value={session.dailyGoalMinutes}
        onChange={(dailyGoalMinutes) => update({ dailyGoalMinutes })}
      />
      <View style={{ minHeight: 16 }} />
    </OnboardingFrame>
  );
}
