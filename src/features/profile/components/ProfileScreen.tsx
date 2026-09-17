import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { useProfile, useProgress } from '@/features/profile/hooks/useProfile';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Avatar, Illustration } from '@/shared/ui/Illustration';
import { ChevronRight, Ellipsis } from '@/shared/ui/icons';
import { NavCircle } from '@/shared/ui/NavCircle';
import { Ring } from '@/shared/ui/Ring';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

const DAYS = ['M', 'D', 'M', 'D', 'F', 'S', 'S'];
const LEVELS: [string, number][] = [
  ['A1', 1],
  ['A2', 0.62],
  ['B1', 0],
  ['B2', 0],
];

function Row({
  label,
  sub,
  value,
  right,
  onPress,
  last,
}: {
  label: string;
  sub?: string;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <>
      <Tap
        haptic="light"
        onPress={onPress}
        className="flex-row items-center px-[18px] py-[15px]"
        style={{ columnGap: 12 }}
      >
        <View className="flex-1">
          <Text className="text-accent-900" style={{ fontSize: 16.5 }}>
            {label}
          </Text>
          {sub ? (
            <Text className="mt-[2px] text-muted" style={{ fontSize: 13.5 }}>
              {sub}
            </Text>
          ) : null}
        </View>
        {value ? (
          <Text className="text-muted" style={{ fontSize: 15.5 }}>
            {value}
          </Text>
        ) : null}
        {right}
        <ChevronRight size={12} color={colors.faint} strokeWidth={3.6} />
      </Tap>
      {!last ? <View className="mx-[18px] h-[1px] bg-line" /> : null}
    </>
  );
}

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
  const progress = useProgress();
  const p = progress.data;
  const week = p?.week ?? [1, 1, 1, 1, 1, 0, 0];
  const pad = (n: number) => String(n).padStart(2, '0');
  const reminder = session.reminder
    ? `${pad(session.reminder.hour)}:${pad(session.reminder.minute)}`
    : '—';

  return (
    <Screen top={0} bottom={6} scroll>
      <View className="flex-1 px-[22px]">
        <View className="h-[40px] flex-row items-center" style={{ columnGap: 12 }}>
          <NavCircle icon="back" />
          <Text className="flex-1 text-center font-medium text-accent-900" style={{ fontSize: 16 }}>
            {t('profile.title')}
          </Text>
          <NavCircle
            icon={<Ellipsis />}
            autoBack={false}
            onPress={() => router.push('/(app)/profile/delete')}
          />
        </View>
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

        <View className="relative mt-[16px] overflow-hidden rounded-[28px] bg-surface px-[22px] py-[20px]">
          <Text className="uppercase text-accent-800" style={{ fontSize: 11, letterSpacing: 1.32 }}>
            {t('profile.streak')}
          </Text>
          <Text
            className="mt-[8px] font-medium text-accent-900"
            style={{ fontSize: 34, lineHeight: 34, letterSpacing: -1.02 }}
          >
            {t('profile.streakDays', { n: p?.streakDays ?? 12 })}
          </Text>
          <Text className="mt-[6px] text-sub" style={{ fontSize: 15, maxWidth: 190 }}>
            {t('profile.todayProgress', {
              done: p?.minutesToday ?? 6,
              goal: session.dailyGoalMinutes,
            })}
          </Text>
          <Illustration
            name="pip-wave"
            size={96}
            style={{ position: 'absolute', right: 10, top: 14 }}
          />
          <View className="mt-[18px] flex-row" style={{ columnGap: 8 }}>
            {week.map((st, i) => (
              <View key={i} className="items-center" style={{ rowGap: 6 }}>
                <View
                  className="h-[30px] w-[30px] items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      st === 1 ? colors.accent[800] : st === 2 ? colors.surface2 : 'transparent',
                    borderWidth: 1.5,
                    borderColor: st === 2 ? colors.accent[600] : '#d2cef5',
                  }}
                >
                  <Text
                    style={{ fontSize: 13, color: st === 1 ? colors.accent[100] : colors.muted }}
                  >
                    {st === 1 ? '✓' : st === 2 ? '·' : ''}
                  </Text>
                </View>
                <Text className="text-muted" style={{ fontSize: 11.5 }}>
                  {DAYS[i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-[14px] rounded-[28px] bg-surface2 px-[22px] py-[20px]">
          <View className="flex-row items-baseline justify-between">
            <Text
              className="uppercase text-accent-800"
              style={{ fontSize: 11, letterSpacing: 1.32 }}
            >
              {t('profile.level')}
            </Text>
            <Text className="text-muted" style={{ fontSize: 13 }}>
              {t('profile.toB1')}
            </Text>
          </View>
          <View className="mt-[12px] flex-row" style={{ columnGap: 6 }}>
            {LEVELS.map(([label, f]) => (
              <View key={label} className="flex-1" style={{ rowGap: 6 }}>
                <View
                  className="h-[8px] overflow-hidden rounded-pill"
                  style={{ backgroundColor: colors.track4 }}
                >
                  <View
                    className="h-full rounded-pill bg-accent-800"
                    style={{ width: `${f * 100}%` }}
                  />
                </View>
                <Text
                  className={cn(f > 0 && f < 1 && 'font-medium')}
                  style={{ fontSize: 13, color: f > 0 ? colors.accent[900] : colors.faint }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <Text className="mt-[14px] text-sub" style={{ fontSize: 14.5, lineHeight: 19.6 }}>
            {t('profile.nextAssessment')}
          </Text>
        </View>

        <View className="mt-[14px] flex-row" style={{ columnGap: 12 }}>
          {[
            {
              n: p?.wordsSaved ?? 86,
              pct: 0.86,
              label: t('profile.wordsSaved'),
              sub: t('profile.wordsSub'),
            },
            { n: p?.talks ?? 19, pct: 0.6, label: t('profile.talks'), sub: t('profile.talksSub') },
          ].map((tile) => (
            <View key={tile.label} className="flex-1 rounded-[24px] bg-surface2 p-[18px]">
              <View className="flex-row items-center" style={{ columnGap: 12 }}>
                <Ring
                  size={38}
                  stroke={5}
                  progress={tile.pct}
                  trackColor={colors.track4}
                  color={colors.accent[600]}
                />
                <Text
                  className="font-medium text-accent-900"
                  style={{ fontSize: 32, lineHeight: 32, letterSpacing: -0.96 }}
                >
                  {tile.n}
                </Text>
              </View>
              <Text className="mt-[12px] text-sub" style={{ fontSize: 14.5 }}>
                {tile.label}
              </Text>
              <Text className="mt-[4px] text-faint" style={{ fontSize: 12.5 }}>
                {tile.sub}
              </Text>
            </View>
          ))}
        </View>

        <Text
          className="mt-[22px] uppercase text-muted"
          style={{ fontSize: 11, letterSpacing: 1.32 }}
        >
          {t('profile.learn')}
        </Text>
        <View className="mt-[8px] rounded-[24px] bg-surface2">
          <Row
            label={t('profile.dailyTime')}
            sub={t('profile.dailySub', {
              ex: t(`profile.goalScreen.ex.${session.dailyGoalMinutes}`),
            })}
            value={`${session.dailyGoalMinutes} ${t('common.min')}`}
            onPress={() => router.push('/(app)/profile/daily-goal')}
          />
          <Row
            label={t('profile.learningLanguage')}
            value={t(`common.language.${session.learningLanguage}`)}
            onPress={() => router.push('/(app)/profile/learning-language')}
          />
          <Row
            label={t('profile.appLanguage')}
            value={t(`common.languageNative.${session.appLanguage}`)}
            onPress={() => router.push('/(app)/profile/app-language')}
          />
          <Row
            label={t('profile.reminder')}
            sub={t('profile.reminderSub', { time: reminder })}
            onPress={() => router.push('/(app)/profile/reminder')}
            last
          />
        </View>

        <Text
          className="mt-[20px] uppercase text-muted"
          style={{ fontSize: 11, letterSpacing: 1.32 }}
        >
          {t('profile.account')}
        </Text>
        <View className="mt-[8px] rounded-[24px] bg-surface2">
          <Row
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
          <Row label={t('profile.help')} onPress={() => router.push('/(app)/rating')} last />
        </View>
        <View className="flex-1" />
      </View>
    </Screen>
  );
}
