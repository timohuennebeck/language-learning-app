import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';
import { OptionCard } from '@/features/onboarding/components/option-card';
import { Button, TextButton } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

const OPTIONS = ['B1', 'B2', 'C1'] as const;

/** 09g · Ziel-Level (8 von 13). */
export function TargetLevelStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, update } = useSession();
  const next = () => router.push('/(onboarding)/daily-goal');
  return (
    <OnboardingFrame
      step={8}
      title={t('onboarding.targetLevel.title')}
      sub={t('onboarding.targetLevel.sub')}
      footer={
        <>
          <Button
            height={60}
            size={17.5}
            label={t('onboarding.targetLevel.cta', { level: session.targetLevel })}
            onPress={next}
          />
          <TextButton className="mt-[16px]" label={t('common.decideLater')} onPress={next} />
        </>
      }
    >
      <View
        className="mt-[16px] flex-row items-center self-start rounded-pill bg-lilac4 py-[7px] pl-[8px] pr-[14px]"
        style={{ columnGap: 8 }}
      >
        <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-white">
          <Text className="font-semibold text-accent-900" style={{ fontSize: 12.5 }}>
            {session.level}
          </Text>
        </View>
        <Text className="text-accent-900" style={{ fontSize: 14.5 }}>
          {t('onboarding.targetLevel.today')}
        </Text>
      </View>
      <View className="mt-[16px]" style={{ rowGap: 10 }}>
        {OPTIONS.map((lvl) => (
          <OptionCard
            key={lvl}
            badge={lvl}
            name={t(`onboarding.targetLevel.options.${lvl}.name`)}
            sub={t(`onboarding.targetLevel.options.${lvl}.sub`)}
            tags={lvl === 'B2' ? [t('onboarding.targetLevel.options.B2.tag')] : undefined}
            nameSize={20}
            subSize={14.5}
            selected={session.targetLevel === lvl}
            onPress={() => update({ targetLevel: lvl })}
          />
        ))}
      </View>
      <View style={{ minHeight: 16 }} />
    </OnboardingFrame>
  );
}
