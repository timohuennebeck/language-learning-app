import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LoadingRing } from '@/shared/components/loading-ring';
import { StepsList } from '@/shared/components/steps-list';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** 08 · Auswertung läuft. Advances to the level result automatically. */
export function EvaluatingStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const steps = t('onboarding.evaluating.steps', { returnObjects: true }) as string[];
  useEffect(() => {
    const id = setTimeout(() => router.replace('/(onboarding)/level-result'), 6000);
    return () => clearTimeout(id);
  }, [router]);
  return (
    <Screen top={-4} bottom={0} className="px-[20px]">
      <View className="flex-1 items-center justify-center" style={{ rowGap: 26 }}>
        <LoadingRing progress={0.68} label="68 %" pip="pip-cheer-2" pipSize={140} />
        <Text
          className="text-center font-semibold text-ink"
          style={{ fontSize: 30, lineHeight: 32.4, letterSpacing: -0.9 }}
        >
          {t('onboarding.evaluating.title')}
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
        {t('onboarding.evaluating.secondsLeft', { n: 6 })}
      </Text>
    </Screen>
  );
}
