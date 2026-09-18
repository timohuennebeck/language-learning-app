import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { ProfileRow } from '@/features/profile/components/profile-row';
import { formatTime } from '@/shared/lib/time';
import { TextButton } from '@/shared/ui/button';
import { Kicker } from '@/shared/ui/kicker';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/** 09i · Einstellungen: learning preferences, account, logout, deletion. */
export function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useSession();
  const reminder = session.reminder
    ? t(`profile.reminderSubs.${session.reminder.repeat}`, {
        time: formatTime(session.reminder.hour, session.reminder.minute),
      })
    : t('profile.reminderOff');
  return (
    <Screen bottom={6} scroll>
      <View className="flex-1 px-[22px]">
        <TopBar left="back" title={t('profile.settings.title')} />
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
            sub={reminder}
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
          <ProfileRow label={t('profile.help')} onPress={() => router.push('/(app)/rating')} />
          <ProfileRow
            label={t('profile.delete.title')}
            onPress={() => router.push('/(app)/profile/delete')}
            last
          />
        </View>
        <TextButton
          className="mt-[18px] h-[48px]"
          label={t('profile.logout.row')}
          color="text-muted"
          size={15.5}
          onPress={() => router.push('/(app)/profile/logout')}
        />
        <View className="flex-1" />
      </View>
    </Screen>
  );
}
