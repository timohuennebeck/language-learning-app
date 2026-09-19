import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, TextButton } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/** 01d-iv · Übung fehlgeschlagen (minimal, mit Fehlercode). */
export function ExerciseErrorScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen bottom={6} className="px-[22px]">
      <TopBar left="close" title={t('error.title')} titleSize={20} />
      <View className="flex-1 items-center justify-center" style={{ rowGap: 22 }}>
        <Illustration name="pip-dizzy" size={150} />
        <View className="items-center">
          <Text
            className="text-center font-semibold text-ink"
            style={{ fontSize: 31, lineHeight: 33.5, letterSpacing: -1.085 }}
          >
            {t('error.headline')}
          </Text>
          <Text
            className="mt-[12px] text-center text-muted"
            style={{ fontSize: 16, lineHeight: 24, maxWidth: 280 }}
          >
            {t('error.sub')}
          </Text>
        </View>
        <View
          className="flex-row items-center rounded-pill bg-surface2 px-[14px] py-[8px]"
          style={{ columnGap: 8 }}
        >
          <Text className="text-sub" style={{ fontSize: 13.5, fontVariant: ['tabular-nums'] }}>
            {t('error.code')}
          </Text>
          <Text className="text-neutral-400" style={{ fontSize: 13.5 }}>
            ·
          </Text>
          <Text className="text-sub" style={{ fontSize: 13.5, fontVariant: ['tabular-nums'] }}>
            {t('error.time')}
          </Text>
        </View>
      </View>
      <View style={{ rowGap: 10 }}>
        <Button
          height={58}
          label={t('error.retry')}
          onPress={() => router.replace('/(app)/exercise/preparing')}
        />
        <TextButton
          className="h-[48px]"
          label={t('error.report')}
          color="text-muted"
          labelClassName="font-regular"
        />
      </View>
    </Screen>
  );
}
