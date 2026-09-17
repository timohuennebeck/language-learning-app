import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/useSession';
import { GradientHeader } from '@/shared/components/GradientHeader';
import { Button, TextButton } from '@/shared/ui/Button';
import { Illustration } from '@/shared/ui/Illustration';
import { Screen } from '@/shared/ui/Screen';
import { Text } from '@/shared/ui/Text';

/** 09e · Profil · Konto löschen. */
export function DeleteAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, reset } = useSession();
  return (
    <Screen edgeToEdgeTop bottom={6} className="px-[22px]">
      <GradientHeader
        left="back"
        title={t('profile.delete.title')}
        circle="translucent"
        className="-mx-[22px]"
      >
        <Illustration name="pip-grumpy" size={212} style={{ marginTop: 24 }} />
      </GradientHeader>
      <View className="items-center">
        <Text
          className="mt-[22px] text-center font-semibold text-ink"
          style={{ fontSize: 31, lineHeight: 33.5, letterSpacing: -1.085 }}
        >
          {t('profile.delete.headline', { name: session.name })}
        </Text>
        <Text className="mt-[12px] text-center text-muted" style={{ fontSize: 16, lineHeight: 24 }}>
          {t('profile.delete.sub')}
        </Text>
        <View
          className="mt-[22px] w-full flex-row items-start rounded-[20px] bg-surface px-[16px] py-[14px]"
          style={{ columnGap: 11 }}
        >
          <View className="mt-[1px] h-[22px] w-[22px] items-center justify-center rounded-full bg-accent-800">
            <Text className="font-semibold text-accent-100" style={{ fontSize: 14 }}>
              i
            </Text>
          </View>
          <Text className="flex-1 text-sub" style={{ fontSize: 14, lineHeight: 20.3 }}>
            {t('profile.delete.info')}
          </Text>
        </View>
      </View>
      <View className="flex-1" />
      <View style={{ rowGap: 10 }}>
        <Button
          height={60}
          size={17.5}
          label={t('profile.delete.confirm')}
          haptic="warning"
          onPress={() => {
            reset();
            router.replace('/');
          }}
        />
        <TextButton
          className="h-[56px]"
          label={t('profile.delete.keep')}
          color="text-accent-900"
          size={16.5}
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}
