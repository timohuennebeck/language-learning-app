import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Tap, type TapProps } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

type Variant =
  'primary' | 'light' | 'surface' | 'outline' | 'muted' | 'ghost' | 'ghost-accent' | 'disabled';

const containerByVariant: Record<Variant, string> = {
  primary: 'bg-accent-800',
  light: 'bg-accent-100',
  surface: 'bg-surface',
  outline: 'bg-transparent border-[1.5px] border-line2',
  muted: 'bg-surface2',
  ghost: 'bg-transparent',
  'ghost-accent': 'bg-transparent',
  disabled: 'bg-surface2',
};

const labelByVariant: Record<Variant, string> = {
  primary: 'text-accent-100 font-semibold',
  light: 'text-accent-800 font-medium',
  surface: 'text-accent-900 font-medium',
  outline: 'text-accent-900 font-semibold',
  muted: 'text-muted font-semibold',
  ghost: 'text-ink2 font-semibold',
  'ghost-accent': 'text-accent-800 font-semibold',
  disabled: 'text-faint font-semibold',
};

export type ButtonProps = Omit<TapProps, 'children' | 'style'> & {
  style?: StyleProp<ViewStyle>;
  label?: string;
  variant?: Variant;
  /** Pill height in px (design uses 52–62). */
  height?: number;
  /** Font size in px. */
  size?: number;
  className?: string;
  labelClassName?: string;
  left?: ReactNode;
  children?: ReactNode;
};

/** Pill-shaped call to action. Fires a medium haptic by default. */
export function Button({
  label,
  variant = 'primary',
  height = 58,
  size = 17,
  className,
  labelClassName,
  left,
  children,
  haptic = 'medium',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const v: Variant = disabled ? 'disabled' : variant;
  return (
    <Tap
      haptic={haptic}
      disabled={disabled}
      accessibilityRole="button"
      className={cn(
        'flex-row items-center justify-center rounded-pill active:opacity-90',
        containerByVariant[v],
        className,
      )}
      style={[{ height }, style]}
      {...props}
    >
      {left ? <View className="mr-[10px]">{left}</View> : null}
      {children ?? (
        <Text className={cn(labelByVariant[v], labelClassName)} style={{ fontSize: size }}>
          {label}
        </Text>
      )}
    </Tap>
  );
}

/** Centered text-only action below a primary button ("Nicht jetzt", "Überspringen"). */
export function TextButton({
  label,
  className,
  labelClassName,
  size = 16,
  color = 'text-ink2',
  ...props
}: Omit<ButtonProps, 'variant'> & { color?: string }) {
  return (
    <Tap
      haptic="light"
      accessibilityRole="button"
      className={cn('items-center justify-center active:opacity-80', className)}
      {...props}
    >
      <Text className={cn('font-semibold', color, labelClassName)} style={{ fontSize: size }}>
        {label}
      </Text>
    </Tap>
  );
}
