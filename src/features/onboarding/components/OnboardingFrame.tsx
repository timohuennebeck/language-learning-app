import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Headline } from '@/shared/components/Headline';
import { useBack } from '@/shared/hooks/useBack';
import { Screen } from '@/shared/ui/Screen';
import { ProgressTopBar } from '@/shared/ui/TopBar';

export const ONBOARDING_STEPS = 13;

type Props = {
  step: number;
  title: string;
  sub?: string;
  kicker?: ReactNode;
  children?: ReactNode;
  /** Bottom actions (primary button + optional text button). */
  footer?: ReactNode;
  scroll?: boolean;
  onBack?: () => void;
  /** Horizontal padding (design: 20 for onboarding steps, 22 for detail screens). */
  px?: number;
  titleMarginTop?: number;
};

/** Onboarding step chrome: progress bar top, headline, content, footer. Padding 56/20/34. */
export function OnboardingFrame({
  step,
  title,
  sub,
  kicker,
  children,
  footer,
  scroll,
  onBack,
  px = 20,
  titleMarginTop = 22,
}: Props) {
  const { t } = useTranslation();
  const back = useBack('/(onboarding)/welcome');
  return (
    <Screen top={-4} bottom={0} scroll={scroll} style={{ paddingHorizontal: px }}>
      <ProgressTopBar
        progress={step / ONBOARDING_STEPS}
        label={t('common.stepOf', { step, total: ONBOARDING_STEPS })}
        onBack={onBack ?? back}
      />
      {kicker}
      <Headline title={title} sub={sub} titleMarginTop={kicker ? 6 : titleMarginTop} />
      {children}
      <View className="flex-1" />
      {footer}
    </Screen>
  );
}
