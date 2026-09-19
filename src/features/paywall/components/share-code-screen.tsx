import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Share, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CodeBoxes } from '@/shared/components/code-boxes';
import { GradientHeader } from '@/shared/components/gradient-header';
import { insetRing } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

const CODE = 'MAJA7K';

/** 15 · Code teilen (später im Produkt, nicht im Onboarding). */
export function ShareCodeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Screen edgeToEdgeTop bottom={0}>
      <GradientHeader
        left="close"
        circle="translucent"
        className="justify-end"
        style={{ height: 300 }}
        paddingBottom={0}
      >
        <Illustration name="pip-pair" size={206} style={{ marginTop: 22 }} />
      </GradientHeader>
      <View className="flex-1 px-[20px]" style={{ minHeight: 0 }}>
        <Text
          className="mt-[20px] font-semibold text-ink"
          style={{ fontSize: 30, lineHeight: 32.4, letterSpacing: -1.05 }}
        >
          {t('shareCode.title')}
        </Text>
        <Text className="mt-[8px] text-muted" style={{ fontSize: 15.5, lineHeight: 22.5 }}>
          {t('shareCode.sub')}
        </Text>
        <View className="mt-[24px] flex-1" style={{ minHeight: 0 }}>
          <CodeBoxes value={CODE} variant="display" />
        </View>
        <View className="flex-row" style={{ columnGap: 10 }}>
          <Button
            className="flex-1"
            height={60}
            variant="ghost"
            label={t('common.copy')}
            labelClassName="text-accent-900"
            style={{ boxShadow: insetRing(1.5, colors.line2) }}
            haptic="success"
            onPress={() => Clipboard.setStringAsync(`https://yori.app/${CODE}`).catch(() => {})}
          />
          <Button
            className="flex-1"
            height={60}
            label={t('common.share')}
            onPress={() => Share.share({ message: `https://yori.app/${CODE}` }).catch(() => {})}
          />
        </View>
        <TextButton
          className="mt-[12px]"
          label={t('common.later')}
          color="text-muted"
          labelClassName="font-regular"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}
