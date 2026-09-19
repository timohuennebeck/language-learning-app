import { useLocalSearchParams, useRouter } from 'expo-router';
import { MicrophoneIcon } from 'phosphor-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/features/auth/hooks/use-session';
import { ScenarioArt } from '@/features/speak/components/scenario-art';
import { tasksForLevel } from '@/features/speak/data/types';
import { useScenario } from '@/features/speak/hooks/use-scenarios';
import { useBack } from '@/shared/hooks/use-back';
import { localized } from '@/shared/lib/i18n';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Gradient, HEADER_GRADIENT } from '@/shared/ui/gradient';
import { Kicker } from '@/shared/ui/kicker';
import { CheckCircle } from '@/shared/ui/marks';
import { NavCircle } from '@/shared/ui/nav-circle';
import { PAGE_TOP, Screen } from '@/shared/ui/screen';
import { Spinner } from '@/shared/ui/spinner';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/**
 * Scenario preview: the same briefing layout as the onboarding role-play
 * (`assessment-call-intro-screen`) — gradient header with the artwork, the situation, the tasks
 * to complete in the talk, then "Gespräch starten". Only the top bar differs: a close circle
 * instead of the onboarding progress.
 */
export function ScenarioScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const back = useBack('/(app)/(tabs)/speak');
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { session } = useSession();
  const scenario = useScenario(slug ?? '', session.learningLanguage);
  const locale = session.appLanguage;

  if (scenario.isPending) {
    return (
      <Screen bottom={6} className="px-[22px]">
        <TopBar left="close" onLeftPress={back} />
        <View className="flex-1 items-center justify-center">
          <Spinner />
        </View>
      </Screen>
    );
  }
  if (scenario.isError) {
    return (
      <Screen bottom={6} className="px-[22px]">
        <TopBar left="close" onLeftPress={back} />
        <Text className="mt-[40px] text-center text-muted" style={{ fontSize: 15 }}>
          {t('speak.loadError')}
        </Text>
      </Screen>
    );
  }

  const s = scenario.data;
  const tasks = tasksForLevel(s, session.level);
  const levels = s.levelMin === s.levelMax ? s.levelMin : `${s.levelMin}–${s.levelMax}`;
  return (
    <Screen
      edgeToEdgeTop
      bottom={6}
      className="px-[22px]"
      footer={
        <Button
          height={60}
          size={17}
          label={t('speak.scenario.cta', { minutes: s.minutes })}
          left={<MicrophoneIcon size={18} color={colors.accent[100]} weight="fill" />}
          // `scenario` is forwarded so start-conversation can add the briefing once it exists.
          onPress={() => router.push({ pathname: '/(app)/live', params: { scenario: s.slug } })}
        />
      }
    >
      <Gradient
        {...HEADER_GRADIENT}
        className="-mx-[22px] items-center overflow-hidden px-[22px]"
        style={{ paddingTop: insets.top + PAGE_TOP, paddingBottom: 18 }}
      >
        <View className="self-stretch">
          <TopBar
            left={<NavCircle icon="close" onPress={back} style={{ backgroundColor: '#fff' }} />}
          />
        </View>
        <View style={{ marginTop: 22 }}>
          <ScenarioArt url={s.illustrationUrl} label={s.title} size={150} radius={26} />
        </View>
      </Gradient>
      <Kicker tracking={0.1} className="mt-[22px] text-accent-700">
        {t('speak.scenario.kicker', {
          language: t(`common.language.${s.language}`),
          levels,
          minutes: s.minutes,
        })}
      </Kicker>
      <Text
        className="mt-[8px] font-semibold text-ink"
        style={{ fontSize: 30, lineHeight: 34, letterSpacing: -0.9 }}
      >
        {s.title}
      </Text>
      <Text className="mt-[8px] text-muted" style={{ fontSize: 15, lineHeight: 22 }}>
        {localized(s.brief, locale)}
      </Text>
      <Kicker tracking={0.1} className="mt-[22px] text-muted">
        {t('speak.scenario.tasks')}
      </Kicker>
      <View className="mt-[12px]" style={{ rowGap: 14 }}>
        {tasks.map((task) => (
          <View key={task.id} className="flex-row items-start" style={{ columnGap: 12 }}>
            <CheckCircle size={26} bg={colors.accent[800]} stroke={2.4} iconSize={13} />
            <View className="flex-1">
              <Text className="text-ink" style={{ fontSize: 15.5, lineHeight: 22 }}>
                {localized(task.text, locale)}
              </Text>
              {task.hint ? (
                <Text className="mt-[3px] text-muted" style={{ fontSize: 13.5, lineHeight: 18 }}>
                  {task.hint}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
      <View style={{ height: 24 }} />
    </Screen>
  );
}
