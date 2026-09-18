import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Headline } from '@/shared/components/headline';
import { useBack } from '@/shared/hooks/use-back';
import { Screen } from '@/shared/ui/screen';
import { ProgressTopBar } from '@/shared/ui/top-bar';

export const ONBOARDING_STEPS = 15;
/** Step numbers of the placement screens that sit between the intro (7) and the target level (11). */
export const PLACEMENT_STEPS = { intro: 7, result1: 8, result2: 9, cafe: 10 } as const;

type Props = {
  step: number;
  title: string;
  sub?: string;
  kicker?: ReactNode;
  children?: ReactNode;
  /** Bottom actions (primary button + optional text button). */
  footer?: ReactNode;
  onBack?: () => void;
  /** Horizontal padding (design: 20 for onboarding steps, 22 for detail screens). */
  px?: number;
  titleMarginTop?: number;
};

/** Onboarding step chrome: progress bar, headline, scrolling content, pinned footer. Padding 56/20/34. */
export function OnboardingFrame({
  step,
  title,
  sub,
  kicker,
  children,
  footer,
  onBack,
  px = 20,
  titleMarginTop = 22,
}: Props) {
  const { t } = useTranslation();
  const back = useBack('/(onboarding)/welcome');
  return (
    <Screen
      top={-4}
      bottom={0}
      style={{ paddingHorizontal: px }}
      footer={footer ? <View className="pt-[12px]">{footer}</View> : undefined}
    >
      <ProgressTopBar
        progress={step / ONBOARDING_STEPS}
        label={t('common.stepOf', { step, total: ONBOARDING_STEPS })}
        onBack={onBack ?? back}
      />
      {kicker}
      <Headline title={title} sub={sub} titleMarginTop={kicker ? 6 : titleMarginTop} />
      {children}
      <View className="flex-1" style={{ minHeight: 12 }} />
    </Screen>
  );
}
