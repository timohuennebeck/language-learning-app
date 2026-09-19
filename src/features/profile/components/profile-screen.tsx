import { useRouter } from 'expo-router';
import { GearIcon } from 'phosphor-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/theme/tokens';
import { useSession } from '@/features/auth/hooks/use-session';
import { AvatarPicker } from '@/features/profile/components/avatar-picker';
import { LevelCard } from '@/features/profile/components/level-card';
import { StatTiles } from '@/features/profile/components/stat-tiles';
import { StreakCard } from '@/shared/components/streak-card';
import { MONTHLY_TALK_QUOTA } from '@/features/profile/data/repository';
import { useProgress } from '@/features/profile/hooks/use-profile';
import { HomeHeader } from '@/shared/components/home-header';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

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
  const p = useProgress().data!;

  return (
    <Screen
      tabRoot
      bottom={6}
      className="px-[22px]"
      header={
        <HomeHeader
          avatar={false}
          right={
            <Tap
              haptic="light"
              hitSlop={8}
              accessibilityLabel={t('profile.settings.title')}
              onPress={() => router.push('/(app)/profile/settings')}
            >
              <GearIcon size={24} color={colors.glyph} weight="regular" />
            </Tap>
          }
        />
      }
    >
      <View className="flex-1">
        <View className="mt-[20px] flex-row items-center" style={{ columnGap: 14 }}>
          <AvatarPicker size={62} />
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
              {session.email ?? t('profile.noAccount')}
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
              // How much of the deck has been through a review; empty while nothing is learned.
              n: p.cardsLearned,
              pct: p.cardsTotal ? p.cardsLearned / p.cardsTotal : 0,
              label: t('profile.cardsLearned'),
              sub: t('profile.last30', { n: p.cardsLast30 }),
            },
            {
              // How much of this month's conversations have been used.
              n: p.talks,
              pct: Math.min(1, p.talksLast30 / MONTHLY_TALK_QUOTA),
              label: t('profile.talks'),
              sub: t('profile.last30', { n: p.talksLast30 }),
            },
          ]}
        />

        <View className="flex-1" />
      </View>
    </Screen>
  );
}
