import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { ONBOARDING_STEPS } from '@/features/onboarding/components/onboarding-frame';
import { Headline } from '@/shared/components/headline';
import { OptionCard } from '@/features/onboarding/components/option-card';
import { Illustration } from '@/shared/ui/illustration';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';
import { ProgressTopBar } from '@/shared/ui/top-bar';

/** Option ids and the (design-given) badges; selecting an option proceeds to the target level step. */
const OPTIONS = [
  { id: 'new', badge: 'A2', level: 'A1' },
  { id: 'bits', badge: 'A1', level: 'A1' },
  { id: 'simple', badge: 'B1', level: 'A2' },
  { id: 'through', badge: 'B2', level: 'B1' },
] as const;

/** 06a · Level selbst wählen (7 von 13, when the placement call is skipped). */
export function LevelSelfStep() {
  const { t } = useTranslation();
  const router = useRouter();
  const { update } = useSession();
  const [selected, setSelected] = useState<string>('simple');
  return (
    <Screen top={0} bottom={6} className="relative px-[22px]">
      <ProgressTopBar
        height={40}
        progress={7 / ONBOARDING_STEPS}
        label={t('common.stepOf', { step: 7, total: ONBOARDING_STEPS })}
      />
      <Headline title={t('onboarding.levelSelf.title')} sub={t('onboarding.levelSelf.sub')} />
      <View className="mt-[20px]" style={{ rowGap: 10 }}>
        {OPTIONS.map((o) => {
          const on = selected === o.id;
          const base = `onboarding.levelSelf.options.${o.id}`;
          return (
            <OptionCard
              key={o.id}
              badge={o.badge}
              name={t(`${base}.name`)}
              sub={t(`${base}.sub`)}
              example={o.id === 'simple' ? undefined : t(`${base}.ex`)}
              tags={o.id === 'simple' ? [t(`${base}.tag1`), t(`${base}.tag2`)] : undefined}
              selected={on}
              onPress={() => {
                setSelected(o.id);
                update({ level: o.level });
                router.push('/(onboarding)/target-level');
              }}
            />
          );
        })}
      </View>
      <View className="flex-1" />
      <Tap
        haptic="light"
        onPress={() => router.push('/(onboarding)/assessment-call')}
        style={{ maxWidth: 196, zIndex: 1 }}
      >
        <Text className="text-muted" style={{ fontSize: 15, lineHeight: 21 }}>
          {t('onboarding.levelSelf.precise')}
          <Text className="font-semibold text-accent-800" style={{ fontSize: 15 }}>
            {t('onboarding.levelSelf.preciseCta')}
          </Text>
        </Text>
      </Tap>
      <Illustration
        name="pip-magnifier"
        size={164}
        pointerEvents="none"
        style={{ position: 'absolute', right: -9, bottom: -25 }}
      />
    </Screen>
  );
}
