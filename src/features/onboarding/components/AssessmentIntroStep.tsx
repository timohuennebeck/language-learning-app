import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { OnboardingFrame } from '@/features/onboarding/components/OnboardingFrame';
import { Button, TextButton } from '@/shared/ui/Button';
import { CardGradient } from '@/shared/ui/Gradient';
import { Illustration } from '@/shared/ui/Illustration';
import { MicSmall } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/Kicker';
import { Text } from '@/shared/ui/Text';

/** 06 · Einstufung Intro (7 von 13). */
export function AssessmentIntroStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const stages = t('onboarding.assessmentIntro.stages', { returnObjects: true }) as string[];
  return (
    <OnboardingFrame
      step={7}
      kicker={<Kicker className="mt-[22px]">{t('onboarding.assessmentIntro.kicker')}</Kicker>}
      title={t('onboarding.assessmentIntro.title')}
      sub={t('onboarding.assessmentIntro.sub')}
      footer={
        <>
          <Button
            height={60}
            size={17.5}
            label={t('onboarding.assessmentIntro.cta')}
            left={<MicSmall />}
            className="[column-gap:2px]"
            onPress={() => router.push('/(onboarding)/assessment-call')}
          />
          <TextButton
            className="mt-[16px]"
            label={t('common.skip')}
            onPress={() => router.push('/(onboarding)/level-self')}
          />
        </>
      }
    >
      <CardGradient className="mt-[18px] items-center p-[18px]" style={{ rowGap: 14 }}>
        <Illustration name="pip-glasses-book" size={168} />
        <View className="w-full rounded-[18px] bg-white px-[16px] py-[14px]">
          <Text className="text-accent-900" style={{ fontSize: 18 }}>
            {t('onboarding.assessmentIntro.question')}
          </Text>
          <Text className="mt-[4px] text-muted" style={{ fontSize: 13.5 }}>
            {t('onboarding.assessmentIntro.stage')}
          </Text>
        </View>
      </CardGradient>
      <Kicker tracking={0.1} className="mt-[18px] text-muted">
        {t('onboarding.assessmentIntro.stagesLabel')}
      </Kicker>
      <View className="mt-[10px] flex-row flex-wrap" style={{ gap: 8 }}>
        {stages.map((s) => (
          <View key={s} className="rounded-pill bg-surface px-[14px] py-[8px]">
            <Text className="text-accent-900" style={{ fontSize: 15 }}>
              {s}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingFrame>
  );
}
