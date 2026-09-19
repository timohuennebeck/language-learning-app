import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/features/auth/hooks/use-session';
import {
  ONBOARDING_STEPS,
  PLACEMENT_STEPS,
} from '@/features/onboarding/components/onboarding-frame';
import { localized } from '@/features/speak/data/schemas';
import { usePlacementScenario } from '@/features/speak/hooks/use-scenarios';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Gradient, HEADER_GRADIENT } from '@/shared/ui/gradient';
import { Illustration } from '@/shared/ui/illustration';
import { MicSmall } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { CheckCircle } from '@/shared/ui/marks';
import { PAGE_TOP, Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { ProgressTopBar } from '@/shared/ui/top-bar';

/**
 * 60c · Einstufung · Rollenspiel-Briefing "Im Café" before the placement call. The scenario row
 * (`scenarios.is_placement`) supplies title, brief and tasks; the bundled copy is the fallback
 * while it loads or when the request fails.
 */
export function AssessmentCallIntroScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const scenario = usePlacementScenario(session.learningLanguage).data;
  const locale = session.appLanguage;
  const title = scenario
    ? localized(scenario.subtitle, locale)
    : t('onboarding.placement.call.title');
  const sub = scenario ? localized(scenario.brief, locale) : t('onboarding.placement.call.sub');
  const tasks = scenario
    ? scenario.tasks.map((task) => localized(task.text, locale))
    : (t('onboarding.placement.call.tasks', { returnObjects: true }) as string[]);
  return (
    <Screen
      edgeToEdgeTop
      bottom={6}
      className="px-[22px]"
      footer={
        <Button
          height={60}
          size={17}
          label={t('onboarding.placement.call.cta')}
          left={<MicSmall size={18} />}
          onPress={() => router.push('/(onboarding)/assessment-call')}
        />
      }
    >
      <Gradient
        {...HEADER_GRADIENT}
        className="-mx-[22px] items-center overflow-hidden px-[22px]"
        style={{ paddingTop: insets.top + PAGE_TOP, paddingBottom: 18 }}
      >
        <ProgressTopBar
          className="self-stretch"
          progress={PLACEMENT_STEPS.cafe / ONBOARDING_STEPS}
          label={t('common.stepOf', { step: PLACEMENT_STEPS.cafe, total: ONBOARDING_STEPS })}
          onBack={() => router.back()}
          backBg="#fff"
        />
        <Illustration name="pip-barista" size={150} style={{ marginTop: 22 }} />
      </Gradient>
      <Kicker tracking={0.1} className="mt-[22px] text-accent-700">
        {t('onboarding.placement.call.kicker')}
      </Kicker>
      <Text
        className="mt-[8px] font-semibold text-ink"
        style={{ fontSize: 30, lineHeight: 34, letterSpacing: -0.9 }}
      >
        {title}
      </Text>
      <Text className="mt-[8px] text-muted" style={{ fontSize: 15, lineHeight: 22 }}>
        {sub}
      </Text>
      <Kicker tracking={0.1} className="mt-[22px] text-muted">
        {t('onboarding.placement.call.tasksLabel')}
      </Kicker>
      <View className="mt-[12px]" style={{ rowGap: 14 }}>
        {tasks.map((task) => (
          <View key={task} className="flex-row items-start" style={{ columnGap: 12 }}>
            <CheckCircle size={26} bg={colors.accent[800]} stroke={2.4} iconSize={13} />
            <Text className="flex-1 text-ink" style={{ fontSize: 15.5, lineHeight: 22 }}>
              {task}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
