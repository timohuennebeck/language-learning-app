import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { localized } from '@/features/speak/data/schemas';
import { usePlacementScenario } from '@/features/speak/hooks/use-scenarios';
import { Button, TextButton } from '@/shared/ui/button';
import { CardGradient } from '@/shared/ui/gradient';
import { Illustration } from '@/shared/ui/illustration';
import { MicSmall } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/**
 * 06 · Einstufung Intro (7 von 13). The script (five staged questions, Pip's brief) is the
 * placement scenario of the learning language; the bundled copy shows until it has loaded.
 */
export function AssessmentIntroStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useSession();
  const placement = usePlacementScenario(session.learningLanguage);
  const fallbackStages = t('onboarding.assessmentIntro.stages', {
    returnObjects: true,
  }) as string[];

  const s = placement.data;
  const stages = s
    ? s.tasks.map((task) => localized(task.text, session.appLanguage))
    : fallbackStages;
  const question = s?.tasks[0]?.hint ?? t('onboarding.assessmentIntro.question');
  const sub = s ? localized(s.brief, session.appLanguage) : t('onboarding.assessmentIntro.sub');
  const cta = s
    ? t('onboarding.assessmentIntro.ctaMinutes', { minutes: s.minutes })
    : t('onboarding.assessmentIntro.cta');

  return (
    <OnboardingFrame
      step={7}
      kicker={<Kicker className="mt-[22px]">{t('onboarding.assessmentIntro.kicker')}</Kicker>}
      title={t('onboarding.assessmentIntro.title')}
      sub={sub}
      footer={
        <>
          <Button
            height={60}
            size={17.5}
            label={cta}
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
            {question}
          </Text>
          <Text className="mt-[4px] text-muted" style={{ fontSize: 13.5 }}>
            {stages[0]
              ? t('onboarding.assessmentIntro.stageOf', { n: 1, name: stages[0] })
              : t('onboarding.assessmentIntro.stage')}
          </Text>
        </View>
      </CardGradient>
      <Kicker tracking={0.1} className="mt-[18px] text-muted">
        {t('onboarding.assessmentIntro.stagesLabel')}
      </Kicker>
      <View className="mt-[10px] flex-row flex-wrap" style={{ gap: 8 }}>
        {stages.map((stage) => (
          <View key={stage} className="rounded-pill bg-surface px-[14px] py-[8px]">
            <Text className="text-accent-900" style={{ fontSize: 15 }}>
              {stage}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingFrame>
  );
}
