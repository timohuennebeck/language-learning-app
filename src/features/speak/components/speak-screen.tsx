import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { ScenarioArt } from '@/features/speak/components/scenario-art';
import {
  fitsLevel,
  localized,
  ScenarioThemeSchema,
  themeForGoal,
  type ScenarioTheme,
} from '@/features/speak/data/schemas';
import { useScenarios } from '@/features/speak/hooks/use-scenarios';
import { HomeHeader } from '@/shared/components/home-header';
import { TalkPreview } from '@/shared/components/previews';
import { cn } from '@/shared/lib/cn';
import { Kicker } from '@/shared/ui/kicker';
import { Screen, TAB_TOP } from '@/shared/ui/screen';
import { Spinner } from '@/shared/ui/spinner';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** Conversations left this period; comes from RevenueCat + the conversations count later. */
const CREDITS = { left: 18, total: 30 };

type Chip = 'forYou' | ScenarioTheme;
const CHIPS: Chip[] = ['forYou', ...ScenarioThemeSchema.options];

/**
 * Sprechen tab · Freies Sprechen: a topic-less call, the theme chips and the scenario tiles from
 * `scenarios` for the active learning language (docs/sprechen-plan.md).
 */
export function SpeakScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const catalogue = useScenarios(session.learningLanguage);
  const [chip, setChip] = useState<Chip>('forYou');

  const forYouTheme = themeForGoal(session.goal);
  const all = catalogue.data ?? [];
  const filtered = all.filter((s) =>
    chip === 'forYou'
      ? fitsLevel(s, session.level) && (!forYouTheme || s.theme === forYouTheme)
      : s.theme === chip,
  );
  // "Für dich" with nothing in the window or theme: show everything rather than an empty grid.
  const visible = chip === 'forYou' && filtered.length === 0 ? all : filtered;

  return (
    <Screen top={TAB_TOP} bottom={6} scroll>
      <View className="flex-1 px-[22px]">
        <HomeHeader />
        <Text
          className="mt-[20px] font-medium text-accent-900"
          style={{ fontSize: 32, lineHeight: 32, letterSpacing: -0.96 }}
        >
          {t('speak.title')}
        </Text>
        <Text className="mt-[6px] text-sub" style={{ fontSize: 16, lineHeight: 22 }}>
          {t('speak.sub')}
        </Text>
        <View className="mt-[10px] self-start rounded-pill bg-lavender px-[12px] py-[5px]">
          <Text className="font-medium text-accent-800" style={{ fontSize: 14 }}>
            {t('speak.credits', CREDITS)}
          </Text>
        </View>

        <Tap
          haptic="light"
          onPress={() => router.push('/(app)/live')}
          accessibilityLabel={t('speak.free.title')}
          className="mt-[18px] items-center rounded-[26px] bg-surface px-[20px] pb-[22px] pt-[16px]"
        >
          <View className="items-center justify-center" style={{ width: 200, height: 100 }}>
            <TalkPreview />
          </View>
          <Kicker tracking={0.14} className="mt-[10px]">
            {t('speak.free.kicker')}
          </Kicker>
          <Text
            className="mt-[4px] text-center font-medium text-accent-900"
            style={{ fontSize: 20, lineHeight: 24, letterSpacing: -0.4 }}
          >
            {t('speak.free.title')}
          </Text>
          <Text
            className="mt-[6px] text-center text-sub"
            style={{ fontSize: 14.5, lineHeight: 19.6 }}
          >
            {t('speak.free.sub')}
          </Text>
          <View className="mt-[14px] items-center self-stretch rounded-pill bg-accent-800 p-[12px]">
            <Text className="font-medium text-accent-100" style={{ fontSize: 16 }}>
              {t('speak.free.cta')}
            </Text>
          </View>
        </Tap>

        <Kicker className="mt-[22px] text-muted">{t('speak.scenarios')}</Kicker>
        <View className="mt-[10px] flex-row overflow-hidden" style={{ columnGap: 8 }}>
          {CHIPS.map((c) => (
            <Tap
              key={c}
              haptic="selection"
              onPress={() => setChip(c)}
              accessibilityState={{ selected: c === chip }}
              className={cn(
                'rounded-pill px-[18px] py-[10px]',
                c === chip ? 'bg-accent-800' : 'bg-surface2',
              )}
            >
              <Text
                className={cn('font-medium', c === chip ? 'text-accent-100' : 'text-accent-900')}
                style={{ fontSize: 15 }}
                numberOfLines={1}
              >
                {t(`speak.themes.${c}`)}
              </Text>
            </Tap>
          ))}
        </View>

        {catalogue.isPending ? (
          <View className="mt-[40px] items-center">
            <Spinner />
          </View>
        ) : catalogue.isError ? (
          <Text className="mt-[24px] text-center text-muted" style={{ fontSize: 15 }}>
            {t('speak.loadError')}
          </Text>
        ) : (
          <View className="mt-[14px] flex-row flex-wrap content-start" style={{ gap: 12 }}>
            {visible.map((s) => (
              <Tap
                key={s.id}
                haptic="light"
                onPress={() =>
                  router.push({ pathname: '/(app)/scenario/[key]', params: { key: s.key } })
                }
                className="rounded-[22px] bg-surface2 p-[14px]"
                style={{ width: (width - 44 - 12) / 2, height: 176 }}
              >
                <View className="flex-1 items-center justify-center" style={{ minHeight: 0 }}>
                  <ScenarioArt url={s.illustrationUrl} label={s.title} />
                </View>
                <Text
                  className="mt-[8px] font-medium text-accent-900"
                  style={{ fontSize: 18, lineHeight: 20.7 }}
                  numberOfLines={1}
                >
                  {s.title}
                </Text>
                <Text className="mt-[2px] text-muted" style={{ fontSize: 13 }} numberOfLines={1}>
                  {t('speak.tileMeta', {
                    subtitle: localized(s.subtitle, session.appLanguage),
                    minutes: s.minutes,
                  })}
                </Text>
              </Tap>
            ))}
          </View>
        )}
        <View className="flex-1" />
      </View>
    </Screen>
  );
}
