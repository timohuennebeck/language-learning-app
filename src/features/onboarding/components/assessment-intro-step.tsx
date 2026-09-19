import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration, type IllustrationName } from '@/shared/ui/illustration';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

const STEPS: { key: 'read' | 'speak'; art: IllustrationName; size: number }[] = [
  { key: 'read', art: 'pip-magnifier', size: 150 },
  { key: 'speak', art: 'pip-barista', size: 150 },
];

/** 60a · Einstufung Intro (7 von 13): two tiles, reading test then role-play. */
export function AssessmentIntroStep() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <OnboardingFrame
      step={7}
      kicker={<Kicker className="mt-[22px]">{t('onboarding.placement.kicker')}</Kicker>}
      title={t('onboarding.placement.title')}
      sub={t('onboarding.placement.sub')}
      footer={
        <>
          <Button
            height={60}
            size={17.5}
            label={t('onboarding.placement.cta')}
            onPress={() => router.push('/(onboarding)/assessment-reading')}
          />
          <TextButton
            className="mt-[16px]"
            label={t('onboarding.placement.self')}
            onPress={() => router.push('/(onboarding)/level-self')}
          />
        </>
      }
    >
      <View className="mt-[18px]" style={{ rowGap: 12 }}>
        {STEPS.map((s, i) => (
          <View
            key={s.key}
            className="relative flex-row items-center overflow-hidden rounded-[26px] bg-surface"
            style={{ height: 196, paddingLeft: 22, paddingRight: 150 }}
          >
            <View className="flex-1" style={{ rowGap: 8 }}>
              <View className="flex-row items-center" style={{ columnGap: 10 }}>
                <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-accent-800">
                  <Text className="font-semibold text-accent-100" style={{ fontSize: 13 }}>
                    {i + 1}
                  </Text>
                </View>
                <Text
                  className="font-semibold text-ink"
                  style={{ fontSize: 23, letterSpacing: -0.46 }}
                >
                  {t(`onboarding.placement.${s.key}.title`)}
                </Text>
              </View>
              <Text className="text-sub" style={{ fontSize: 15, lineHeight: 21 }}>
                {t(`onboarding.placement.${s.key}.sub`)}
              </Text>
            </View>
            <Illustration
              name={s.art}
              size={s.size}
              style={{ position: 'absolute', right: 16, top: (196 - s.size) / 2 }}
            />
          </View>
        ))}
      </View>
    </OnboardingFrame>
  );
}
