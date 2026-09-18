import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { LevelCard } from '@/features/profile/components/level-card';
import { ProfileRow } from '@/features/profile/components/profile-row';
import { StatTiles } from '@/features/profile/components/stat-tiles';
import { StreakCard } from '@/features/profile/components/streak-card';
import { useProfile, useProgress } from '@/features/profile/hooks/use-profile';
import { formatTime } from '@/shared/lib/time';
import { Avatar } from '@/shared/ui/illustration';
import { Ellipsis } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

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
  const reminder = session.reminder
    ? formatTime(session.reminder.hour, session.reminder.minute)
    : '—';

  return (
    <Screen top={0} bottom={6} scroll>
      <View className="flex-1 px-[22px]">
        <TopBar
          title={t('profile.title')}
          right={
            <NavCircle
              icon={<Ellipsis />}
              autoBack={false}
              accessibilityLabel={t('profile.delete.title')}
              onPress={() => router.push('/(app)/profile/delete')}
            />
          }
        />
        <View className="mt-[16px] flex-row items-center" style={{ columnGap: 14 }}>
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

        <Kicker className="mt-[22px] text-muted">{t('profile.learn')}</Kicker>
        <View className="mt-[8px] rounded-[24px] bg-surface2">
          <ProfileRow
            label={t('profile.dailyTime')}
            sub={t('profile.dailySub', {
              ex: t(`profile.goalScreen.ex.${session.dailyGoalMinutes}`),
            })}
            value={`${session.dailyGoalMinutes} ${t('common.min')}`}
            onPress={() => router.push('/(app)/profile/daily-goal')}
          />
          <ProfileRow
            label={t('profile.learningLanguage')}
            value={t(`common.language.${session.learningLanguage}`)}
            onPress={() => router.push('/(app)/profile/learning-language')}
          />
          <ProfileRow
            label={t('profile.appLanguage')}
            value={t(`common.languageNative.${session.appLanguage}`)}
            onPress={() => router.push('/(app)/profile/app-language')}
          />
          <ProfileRow
            label={t('profile.reminder')}
            sub={t('profile.reminderSub', { time: reminder })}
            onPress={() => router.push('/(app)/profile/reminder')}
            last
          />
        </View>

        <Kicker className="mt-[20px] text-muted">{t('profile.account')}</Kicker>
        <View className="mt-[8px] rounded-[24px] bg-surface2">
          <ProfileRow
            label={t('profile.plus')}
            right={
              <View className="rounded-pill bg-accent-800 px-[10px] py-[4px]">
                <Text className="font-medium text-accent-100" style={{ fontSize: 12.5 }}>
                  {t('profile.active')}
                </Text>
              </View>
            }
            onPress={() => router.push('/(app)/talk-limit')}
          />
          <ProfileRow label={t('profile.help')} onPress={() => router.push('/(app)/rating')} last />
        </View>
        <View className="flex-1" />
      </View>
    </Screen>
  );
}
