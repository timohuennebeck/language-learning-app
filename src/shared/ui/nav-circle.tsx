import type { ReactNode } from 'react';
import { CaretLeftIcon, XIcon } from 'phosphor-react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/theme/tokens';
import { useBack } from '@/shared/hooks/use-back';
import { cn } from '@/shared/lib/cn';
import { Tap, type TapProps } from '@/shared/ui/tap';

interface Props extends Omit<TapProps, 'children' | 'style'> {
  style?: StyleProp<ViewStyle>;
  icon: 'back' | 'close' | ReactNode;
  size?: number;
  className?: string;
  /** Icon color. */
  color?: string;
  /** When true, a missing onPress falls back to going back (or home). */
  autoBack?: boolean;
}

/** 36px circular icon button used for back/close in every top bar. */
export function NavCircle({
  icon,
  size = 36,
  className,
  color,
  autoBack = true,
  onPress,
  style,
  accessibilityLabel,
  ...props
}: Props) {
  const { t } = useTranslation();
  const back = useBack();
  const label =
    accessibilityLabel ??
    (icon === 'back' ? t('common.back') : icon === 'close' ? t('common.close') : undefined);
  return (
    <Tap
      haptic="light"
      accessibilityLabel={label}
      onPress={onPress ?? (autoBack ? back : undefined)}
      className={cn(
        'items-center justify-center rounded-full bg-surface active:opacity-80',
        className,
      )}
      style={[{ width: size, height: size }, style]}
      {...props}
    >
      {icon === 'back' ? (
        <CaretLeftIcon size={14} color={color ?? colors.glyph} weight="bold" />
      ) : icon === 'close' ? (
        <XIcon size={18} color={color ?? colors.accent[900]} weight="bold" />
      ) : (
        icon
      )}
    </Tap>
  );
}
