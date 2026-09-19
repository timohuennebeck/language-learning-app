import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { useDueCount } from '@/features/flashcards/hooks/use-deck';
import { useHomeFeed } from '@/features/lessons/hooks/use-lessons';
import { useProgress } from '@/features/profile/hooks/use-profile';
import { HeroCarousel } from '@/shared/components/hero-carousel';
import { HomeHeader } from '@/shared/components/home-header';
import {
  CardsPreview,
  ExercisePreview,
  ReadPreview,
  TalkPreview,
} from '@/shared/components/previews';
import { StreakCard } from '@/shared/components/streak-card';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/**
 * 01 · Lernen (home): today's numbers, the carousel of what Pip generated and the streak.
 * Scenario tiles live on the Sprechen tab (docs/sprechen-plan.md).
 */
export function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useSession();
  const feed = useHomeFeed();
  const progress = useProgress().data!;
  const minutes = feed.data?.minutesToday ?? 6;
  const goal = feed.data?.goalMinutes ?? session.dailyGoalMinutes;
  // Real count, so the pill, the hero card and the deck behind them can never disagree.
  // `undefined` while it loads: neither "12 fällig" nor "keine fällig" is true yet.
  const dueCards = useDueCount().data;
  const due = dueCards ?? 0;

  return (
    <Screen tabRoot bottom={6} className="px-[22px]" header={<HomeHeader />}>
      <View className="flex-1">
        <Text
          className="mb-[4px] mt-[20px] font-medium text-accent-900"
          style={{ fontSize: 32, lineHeight: 32, letterSpacing: -0.96 }}
        >
          {t('home.greeting', { name: session.name })}
        </Text>
        <View className="flex-row flex-wrap items-center" style={{ gap: 10 }}>
          <Text className="text-sub" style={{ fontSize: 16 }}>
            {t('home.today', { done: minutes, goal })}
          </Text>
          {due ? (
            <Tap
              haptic="light"
              onPress={() => router.push('/(app)/flashcards')}
              className="flex-row items-center rounded-pill bg-lavender py-[5px] pl-[9px] pr-[12px]"
              style={{ columnGap: 7 }}
            >
              <View className="h-[20px] min-w-[20px] items-center justify-center rounded-pill bg-accent-800 px-[6px]">
                <Text className="font-semibold text-accent-100" style={{ fontSize: 12.5 }}>
                  {due}
                </Text>
              </View>
              <Text className="font-medium text-accent-800" style={{ fontSize: 14 }}>
                {t('home.due')}
              </Text>
            </Tap>
          ) : null}
        </View>
        <HeroCarousel
          className="mt-[16px]"
          cards={[
            {
              key: 'talk',
              preview: <TalkPreview />,
              kicker: t('home.hero.talk.kicker'),
              title: t('home.hero.talk.title'),
              cta: t('home.hero.talk.cta'),
              // The Sprechen tab decides what to talk about (free talk or a scenario).
              onPress: () => router.push('/(app)/(tabs)/speak'),
            },
            {
              key: 'read',
              preview: <ReadPreview />,
              kicker: t('home.hero.read.kicker'),
              title: t('home.hero.read.title'),
              cta: t('home.hero.read.cta'),
              onPress: () => router.push('/(app)/reading'),
            },
            {
              key: 'exercise',
              preview: (
                <ExercisePreview
                  wrong={t('home.hero.exercise.wrong')}
                  right={t('home.hero.exercise.right')}
                />
              ),
              kicker: t('home.hero.exercise.kicker'),
              title: t('home.hero.exercise.title'),
              cta: t('home.hero.exercise.cta'),
              onPress: () => router.push('/(app)/exercise/preparing'),
            },
            {
              key: 'cards',
              preview: <CardsPreview />,
              kicker:
                dueCards === undefined
                  ? t('home.hero.cards.kickerIdle')
                  : dueCards === 0
                    ? t('home.hero.cards.kickerNone')
                    : t('home.hero.cards.kicker', { count: dueCards }),
              title: t('home.hero.cards.title'),
              cta: t('home.hero.cards.cta'),
              onPress: () => router.push('/(app)/flashcards'),
            },
          ]}
        />

        <StreakCard
          className="mt-[18px]"
          streakDays={progress.streakDays}
          minutesToday={minutes}
          goalMinutes={goal}
          week={progress.week}
        />
        <View className="flex-1" />
      </View>
    </Screen>
  );
}
