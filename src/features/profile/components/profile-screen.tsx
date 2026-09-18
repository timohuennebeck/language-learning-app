import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { LevelCard } from '@/features/profile/components/level-card';
import { ProfileRow } from '@/features/profile/components/profile-row';
import { StatTiles } from '@/features/profile/components/stat-tiles';
import { StreakCard } from '@/features/profile/components/streak-card';
import { DESIGN_PROGRESS } from '@/features/profile/data/repository';
import { useProfile, useProgress } from '@/features/profile/hooks/use-profile';
import { HomeHeader } from '@/shared/components/home-header';
import { Avatar } from '@/shared/ui/illustration';
import { CogIcon } from '@/shared/ui/icons';
import { Screen, TAB_TOP } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

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
  const p = useProgress().data ?? DESIGN_PROGRESS;

  return (
    <Screen top={TAB_TOP} bottom={6} scroll>
      <View className="flex-1 px-[22px]">
        <HomeHeader />
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

        <View className="mt-[14px] rounded-[24px] bg-surface2">
          <ProfileRow
            label={t('profile.settings.title')}
            left={<CogIcon />}
            onPress={() => router.push('/(app)/profile/settings')}
            last
          />
        </View>
        <View className="flex-1" />
      </View>
    </Screen>
  );
}
