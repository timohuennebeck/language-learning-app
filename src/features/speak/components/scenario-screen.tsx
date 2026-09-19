import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { ScenarioArt } from '@/features/speak/components/scenario-art';
import { localized, tasksForLevel } from '@/features/speak/data/schemas';
import { useScenario } from '@/features/speak/hooks/use-scenarios';
import { Headline } from '@/shared/components/headline';
import { useBack } from '@/shared/hooks/use-back';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { CardGradient } from '@/shared/ui/gradient';
import { MicSmall } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { Screen } from '@/shared/ui/screen';
import { Spinner } from '@/shared/ui/spinner';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/**
 * Scenario preview (after 06 "Einstufung Intro"): the situation, the tasks to complete in the
 * talk, then "Gespräch starten". The call itself still opens the design's live screen.
 */
export function ScenarioScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const back = useBack('/(app)/(tabs)/speak');
  const { key } = useLocalSearchParams<{ key: string }>();
  const { session } = useSession();
  const scenario = useScenario(key ?? '', session.learningLanguage);
  const locale = session.appLanguage;

  if (scenario.isPending) {
    return (
      <Screen top={0} bottom={6} className="px-[22px]">
        <TopBar left="close" onLeftPress={back} />
        <View className="flex-1 items-center justify-center">
          <Spinner />
        </View>
      </Screen>
    );
  }
  if (scenario.isError) {
    return (
      <Screen top={0} bottom={6} className="px-[22px]">
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
      top={0}
      bottom={6}
      scroll
      footer={
        <View className="px-[22px] pt-[12px]">
          <Button
            height={60}
            size={17.5}
            label={t('speak.scenario.cta', { minutes: s.minutes })}
            left={<MicSmall />}
            className="[column-gap:2px]"
            // `scenario` is forwarded so start-conversation can add the briefing once it exists.
            onPress={() => router.push({ pathname: '/(app)/live', params: { scenario: s.key } })}
          />
        </View>
      }
    >
      <View className="px-[22px]">
        <TopBar left="close" onLeftPress={back} />
        <Kicker className="mt-[22px]">
          {t('speak.scenario.kicker', {
            language: t(`common.language.${s.language}`),
            levels,
            minutes: s.minutes,
          })}
        </Kicker>
        <Headline title={s.title} sub={localized(s.subtitle, locale)} titleMarginTop={6} />
        <CardGradient className="mt-[18px] items-center p-[18px]" style={{ rowGap: 14 }}>
          <ScenarioArt url={s.illustrationUrl} label={s.title} size={150} radius={26} />
          <View className="w-full rounded-[18px] bg-white px-[16px] py-[14px]">
            <Text className="text-accent-900" style={{ fontSize: 16, lineHeight: 22.4 }}>
              {localized(s.brief, locale)}
            </Text>
          </View>
        </CardGradient>
        <Kicker tracking={0.1} className="mt-[18px] text-muted">
          {t('speak.scenario.tasks')}
        </Kicker>
        <View className="mt-[10px]" style={{ rowGap: 8 }}>
          {tasks.map((task, i) => (
            <View
              key={task.id}
              className="flex-row items-start rounded-[18px] bg-surface px-[14px] py-[12px]"
              style={{ columnGap: 12 }}
            >
              <View
                className="mt-[1px] h-[24px] w-[24px] items-center justify-center rounded-full"
                style={{ backgroundColor: colors.accent[800] }}
              >
                <Text className="font-semibold text-accent-100" style={{ fontSize: 12.5 }}>
                  {i + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-accent-900" style={{ fontSize: 15.5, lineHeight: 21 }}>
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
      </View>
    </Screen>
  );
}
