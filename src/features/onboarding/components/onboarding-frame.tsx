import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Headline } from '@/shared/components/headline';
import { useBack } from '@/shared/hooks/use-back';
import { Screen } from '@/shared/ui/screen';
import { ProgressTopBar, TopBar } from '@/shared/ui/top-bar';

export const ONBOARDING_STEPS = 17;
/** Step numbers of the screens that carry the bar without an OnboardingFrame. */
export const PLACEMENT_STEPS = {
  intro: 7,
  result1: 8,
  result2: 9,
  cafe: 10,
  readingResult: 11,
  speakingResult: 12,
  prognosis: 15,
} as const;

type Props = {
  /** Onboarding step shown in the progress bar; omit for a plain back bar (e.g. login). */
  step?: number;
  title: string;
  sub?: string;
  kicker?: ReactNode;
  children?: ReactNode;
  /** Bottom actions (primary button + optional text button). */
  footer?: ReactNode;
  onBack?: () => void;
};

/** Onboarding step chrome: progress bar, headline, scrolling content, pinned footer. Padding 56/20/34. */
export function OnboardingFrame({ step, title, sub, kicker, children, footer, onBack }: Props) {
  const { t } = useTranslation();
  const back = useBack('/(onboarding)/welcome');
  return (
    <Screen
      bottom={0}
      className="px-[20px]"
      footer={footer ? <View className="pt-[12px]">{footer}</View> : undefined}
    >
      {step === undefined ? (
        <TopBar onLeftPress={onBack ?? back} />
      ) : (
        <ProgressTopBar
          progress={step / ONBOARDING_STEPS}
          label={t('common.stepOf', { step, total: ONBOARDING_STEPS })}
          onBack={onBack ?? back}
        />
      )}
      {kicker}
      <Headline title={title} sub={sub} titleMarginTop={kicker ? 6 : 22} />
      {children}
      <View className="flex-1" style={{ minHeight: 12 }} />
    </Screen>
  );
}
