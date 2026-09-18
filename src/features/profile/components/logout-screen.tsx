import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Avatar, Illustration } from '@/shared/ui/illustration';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/** 41a · Profil · Abmelden bestätigen. */
export function LogoutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, reset } = useSession();
  const profile = useProfile();
  return (
    <Screen
      bottom={6}
      className="px-[22px]"
      footer={
        <View style={{ rowGap: 6 }}>
          <Button
            height={58}
            size={17}
            label={t('profile.logout.stay')}
            onPress={() => router.back()}
          />
          <TextButton
            className="h-[48px]"
            label={t('profile.logout.confirm')}
            color="text-sub"
            size={15.5}
            haptic="warning"
            onPress={() => {
              // Mock session only; Supabase signOut replaces `reset()` later.
              reset();
              router.replace('/');
            }}
          />
        </View>
      }
    >
      <TopBar left="back" title={t('profile.logout.title')} />
      <View className="items-center">
        <Illustration name="pip-door" size={150} style={{ marginTop: 26 }} />
        <Text
          className="mt-[20px] text-center font-semibold text-ink"
          style={{ fontSize: 26, lineHeight: 30, letterSpacing: -0.78 }}
        >
          {t('profile.logout.headline')}
        </Text>
        <Text
          className="mt-[8px] px-[10px] text-center text-muted"
          style={{ fontSize: 15, lineHeight: 22 }}
        >
          {t('profile.logout.sub')}
        </Text>
      </View>
      <View
        className="mt-[24px] flex-row items-center rounded-[20px] bg-white px-[16px] py-[14px]"
        style={{ columnGap: 12, boxShadow: `0 0 0 1px ${colors.line2}` }}
      >
        <Avatar size={40} />
        <View className="flex-1">
          <Text className="font-semibold text-ink" style={{ fontSize: 16 }}>
            {session.name}
          </Text>
          <Text className="mt-[1px] text-muted" style={{ fontSize: 13.5 }}>
            {profile.data?.email ?? t('profile.email')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
