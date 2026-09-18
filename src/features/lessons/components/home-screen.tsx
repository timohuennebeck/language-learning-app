import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { HeroCarousel } from '@/shared/components/hero-carousel';
import { IllustrationSlot } from '@/features/lessons/components/illustration-slot';
import {
  CardsPreview,
  ExercisePreview,
  ReadPreview,
  TalkPreview,
} from '@/shared/components/previews';
import { useHomeFeed } from '@/features/lessons/hooks/use-lessons';
import { HomeHeader } from '@/shared/components/home-header';
import { cn } from '@/shared/lib/cn';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** 01 · Lektionen (home). */
export function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const feed = useHomeFeed();
  const filters = t('home.filters', { returnObjects: true }) as string[];
  const minutes = feed.data?.minutesToday ?? 6;
  const goal = feed.data?.goalMinutes ?? 10;
  const due = feed.data?.dueCards ?? 12;
  const lessons = feed.data?.lessons ?? [];
  // Filters are visual for now; the lesson list is filtered once course content exists.
  const [filter, setFilter] = useState(0);

  return (
    <Screen top={0} bottom={6} scroll>
      <View className="flex-1 px-[22px]">
        <HomeHeader />
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
              onPress: () => router.push('/(app)/live'),
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
              kicker: t('home.hero.cards.kicker'),
              title: t('home.hero.cards.title'),
              cta: t('home.hero.cards.cta'),
              onPress: () => router.push('/(app)/flashcards'),
            },
          ]}
        />
        <View className="mt-[18px] flex-row overflow-hidden" style={{ columnGap: 8 }}>
          {filters.map((f, i) => (
            <Tap
              key={f}
              haptic="selection"
              onPress={() => setFilter(i)}
              accessibilityState={{ selected: i === filter }}
              className={cn(
                'rounded-pill px-[18px] py-[10px]',
                i === filter ? 'bg-accent-800' : 'bg-surface2',
              )}
            >
              <Text
                className={cn('font-medium', i === filter ? 'text-accent-100' : 'text-accent-900')}
                style={{ fontSize: 15 }}
                numberOfLines={1}
              >
                {f}
              </Text>
            </Tap>
          ))}
        </View>
        <View className="mt-[14px] flex-row flex-wrap content-start" style={{ gap: 12 }}>
          {lessons.map((l) => (
            <Tap
              key={l.id}
              haptic="light"
              onPress={() => router.push({ pathname: '/(app)/lesson/[id]', params: { id: l.id } })}
              className="rounded-[22px] bg-surface2 p-[14px]"
              style={{ width: (width - 44 - 12) / 2, height: 176 }}
            >
              <View className="flex-1 items-center justify-center" style={{ minHeight: 0 }}>
                <IllustrationSlot placeholder={l.placeholder} />
              </View>
              <Text
                className="mt-[8px] font-medium text-accent-900"
                style={{ fontSize: 18, lineHeight: 20.7 }}
              >
                {l.title}
              </Text>
              <Text className="mt-[2px] text-muted" style={{ fontSize: 13 }} numberOfLines={1}>
                {l.meta}
              </Text>
            </Tap>
          ))}
        </View>
      </View>
    </Screen>
  );
}
