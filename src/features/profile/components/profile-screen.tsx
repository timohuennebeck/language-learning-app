import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { LevelCard } from '@/features/profile/components/level-card';
import { StatTiles } from '@/features/profile/components/stat-tiles';
import { StreakCard } from '@/features/profile/components/streak-card';
import { useProfile, useProgress } from '@/features/profile/hooks/use-profile';
import { HomeHeader } from '@/shared/components/home-header';
import { Avatar } from '@/shared/ui/illustration';
import { CogIcon } from '@/shared/ui/icons';
import { Screen, TAB_TOP } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** Design values shown while the progress query is loading. */
const FALLBACK = {
  streakDays: 12,
  minutesToday: 6,
  week: [1, 1, 1, 1, 1, 0, 0],
  levelProgress: 0.62,
  wordsSaved: 86,
  wordsGoal: 100,
  talks: 19,
  talksLast30: 6,
};

/** Talks tile ring: the design shows 60% for 19 talks; there is no goal for talks yet. */
const TALKS_RING = 0.6;

function VerifiedMark() {
  return (
    <View style={{ width: 21, height: 21 }}>
      <View className="absolute inset-0 rounded-[5px] bg-accent-800" />
      <View
        className="absolute inset-0 rounded-[5px] bg-accent-800"
        style={{ transform: [{ rotate: '45deg' }] }}
      />
      <View className="absolute inset-0 items-center justify-center">
        <Text className="font-bold text-accent-100" style={{ fontSize: 11, lineHeight: 12 }}>
          ✓
        </Text>
      </View>
    </View>
  );
}

/** 09b · Profil · Fortschritt & Serie. */
export function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useSession();
  const profile = useProfile();
  const p = useProgress().data ?? FALLBACK;

  return (
    <Screen top={TAB_TOP} bottom={6} scroll>
      <View className="flex-1 px-[22px]">
        <HomeHeader
          right={
            <Tap
              haptic="light"
              hitSlop={8}
              accessibilityLabel={t('profile.settings.title')}
              onPress={() => router.push('/(app)/profile/settings')}
            >
              <CogIcon size={24} />
            </Tap>
          }
        />
        <View className="mt-[20px] flex-row items-center" style={{ columnGap: 14 }}>
          <Avatar size={62} />
          <View>
            <View className="flex-row items-center" style={{ columnGap: 7 }}>
              <Text
                className="font-medium text-accent-900"
                style={{ fontSize: 26, letterSpacing: -0.52 }}
              >
                {session.name}
              </Text>
              <VerifiedMark />
            </View>
            <Text className="mt-[2px] text-muted" style={{ fontSize: 14.5 }}>
              {profile.data?.email ?? t('profile.email')}
            </Text>
          </View>
        </View>

        <StreakCard
          className="mt-[16px]"
          streakDays={p.streakDays}
          minutesToday={p.minutesToday}
          goalMinutes={session.dailyGoalMinutes}
          week={p.week}
        />
        <LevelCard className="mt-[14px]" level={session.level} progress={p.levelProgress} />
        <StatTiles
          className="mt-[14px]"
          tiles={[
            {
              n: p.wordsSaved,
              pct: p.wordsGoal ? p.wordsSaved / p.wordsGoal : 0,
              label: t('profile.wordsSaved'),
              sub: t('profile.wordsSub'),
            },
            {
              n: p.talks,
              pct: TALKS_RING,
              label: t('profile.talks'),
              sub: t('profile.talksSub'),
            },
          ]}
        />

        <View className="flex-1" />
      </View>
    </Screen>
  );
}
