import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LoadingRing } from '@/shared/components/LoadingRing';
import { StepsList } from '@/shared/components/StepsList';
import { Screen } from '@/shared/ui/Screen';
import { Text } from '@/shared/ui/Text';
import { TopBar } from '@/shared/ui/TopBar';

/** 01c · Übung wird vorbereitet. Hands off to the exercise flow once "done". */
export function PreparingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const steps = t('preparing.steps', { returnObjects: true }) as string[];
  useEffect(() => {
    const id = setTimeout(() => router.replace('/(app)/exercise'), 4000);
    return () => clearTimeout(id);
  }, [router]);
  return (
    <Screen top={0} bottom={6} className="px-[22px]">
      <TopBar left="close" title={t('preparing.title')} titleSize={20} />
      <View className="flex-1 items-center justify-center" style={{ rowGap: 26 }}>
        <LoadingRing progress={0.62} label="62 %" pip="pip-cheer-2" />
        <Text
          className="text-center font-semibold text-ink"
          style={{ fontSize: 30, lineHeight: 32.4, letterSpacing: -0.9, maxWidth: 300 }}
        >
          {t('preparing.headline')}
        </Text>
        <StepsList
          steps={[
            { label: steps[0], state: 'done' },
            { label: steps[1], state: 'done' },
            { label: steps[2], state: 'active' },
            { label: steps[3], state: 'pending' },
          ]}
        />
      </View>
      <Text className="text-center text-muted" style={{ fontSize: 14.5 }}>
        {t('preparing.secondsLeft', { n: 8 })}
      </Text>
    </Screen>
  );
}
