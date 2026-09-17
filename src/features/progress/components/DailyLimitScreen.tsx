import { useRouter } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { HeroCarousel } from '@/features/lessons/components/HeroCarousel';
import { CardsPreview, ExercisePreview, ReadPreview } from '@/features/lessons/components/Previews';
import { GradientHeader } from '@/shared/components/GradientHeader';
import { TextButton } from '@/shared/ui/Button';
import { Illustration } from '@/shared/ui/Illustration';
import { Clock } from '@/shared/ui/icons';
import { Screen } from '@/shared/ui/Screen';
import { Text } from '@/shared/ui/Text';

/** 08 · Tägliches Limit erreicht (nach der Session). */
export function DailyLimitScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const goal = session.dailyGoalMinutes;
  return (
    <Screen edgeToEdgeTop bottom={6} className="relative px-[22px]">
      <GradientHeader
        left="close"
        className="-mx-[22px]"
        onLeftPress={() => router.replace('/(app)')}
      >
        <Illustration name="pip-wave" size={156} style={{ marginTop: -20, marginBottom: 12 }} />
        <View
          className="flex-row items-center rounded-pill bg-bg px-[16px] py-[8px]"
          style={{ columnGap: 8, boxShadow: '0 2px 10px rgba(41,43,49,.06)' }}
        >
          <Clock size={17} />
          <Text className="font-medium text-accent-900" style={{ fontSize: 14.5 }}>
            {t('dailyLimit.practiced', { done: goal, goal })}
          </Text>
        </View>
      </GradientHeader>
      <Text
        className="mt-[22px] font-medium text-accent-900"
        style={{ fontSize: 34, lineHeight: 35.7, letterSpacing: -1.02 }}
      >
        {t('dailyLimit.title')}
      </Text>
      <Text className="mt-[9px] text-sub" style={{ fontSize: 16, lineHeight: 23.2, maxWidth: 280 }}>
        {t('dailyLimit.resetIn1')}
        <Text className="font-medium text-accent-900" style={{ fontSize: 16 }}>
          {t('dailyLimit.resetTime')}
        </Text>
        {t('dailyLimit.resetIn2')}
      </Text>
      <HeroCarousel
        className="-mx-[22px] mt-[24px]"
        dotsClassName="mt-[14px]"
        screenWidth={width}
        cards={[
          {
            key: 'cards',
            preview: <CardsPreview />,
            kicker: t('dailyLimit.cards.kicker'),
            title: t('dailyLimit.cards.title'),
            cta: t('dailyLimit.cards.cta'),
            onPress: () => router.push('/(app)/flashcards'),
          },
          {
            key: 'exercise',
            preview: (
              <ExercisePreview
                wrong={t('home.hero.exercise.wrong')}
                right={t('home.hero.exercise.right')}
              />
            ),
            kicker: t('dailyLimit.exercise.kicker'),
            title: t('dailyLimit.exercise.title'),
            cta: t('dailyLimit.exercise.cta'),
            onPress: () => router.push('/(app)/exercise/preparing'),
          },
          {
            key: 'read',
            preview: <ReadPreview />,
            kicker: t('dailyLimit.read.kicker'),
            title: t('dailyLimit.read.title'),
            cta: t('dailyLimit.read.cta'),
            onPress: () => router.push('/(app)/reading'),
          },
        ]}
      />
      <View className="flex-1" />
      <TextButton
        label={t('dailyLimit.bye')}
        color="text-sub"
        labelClassName="font-medium"
        onPress={() => router.replace('/(app)')}
      />
    </Screen>
  );
}
