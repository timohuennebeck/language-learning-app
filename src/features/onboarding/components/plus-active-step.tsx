import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** 13 · Plus aktiv (Bestätigung nach Kauf und Konto). */
export function PlusActiveStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  return (
    <Screen bottom={0} className="px-[22px]">
      <View className="h-[34px] justify-center">
        <NavCircle icon="close" onPress={() => router.push('/(onboarding)/widget')} />
      </View>
      <Text
        className="mt-[30px] text-center font-semibold text-ink"
        style={{ fontSize: 33, lineHeight: 35.6, letterSpacing: -1.155 }}
      >
        {t('onboarding.plusActive.title', { name: session.name })}
      </Text>
      <Text
        className="mt-[14px] text-center text-accent-800"
        style={{ fontSize: 16.5, lineHeight: 23.9 }}
      >
        {t('onboarding.plusActive.sub')}
      </Text>
      <View className="flex-1 items-center justify-center">
        <Illustration name="pip-cheer-1" size={258} />
      </View>
      <View style={{ height: 38 }} />
      <Button
        height={62}
        size={18}
        label={t('common.next')}
        onPress={() => {
          update({ plusActive: true });
          router.push('/(onboarding)/widget');
        }}
      />
      <TextButton className="mt-[16px]" label={t('onboarding.plusActive.manage')} />
    </Screen>
  );
}
