import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import type { StyleProp, ViewStyle } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Tap, type TapProps } from '@/shared/ui/Tap';
import { BackIcon, CloseIcon } from '@/shared/ui/icons';

type Props = Omit<TapProps, 'children' | 'style'> & {
  style?: StyleProp<ViewStyle>;
  icon: 'back' | 'close' | ReactNode;
  size?: number;
  className?: string;
  /** Icon color. */
  color?: string;
  /** When true, a missing onPress falls back to router.back(). */
  autoBack?: boolean;
};

/** 32px circular icon button used for back/close in every top bar. */
export function NavCircle({
  icon,
  size = 32,
  className,
  color,
  autoBack = true,
  onPress,
  style,
  ...props
}: Props) {
  const router = useRouter();
  const handle =
    onPress ??
    (autoBack ? () => (router.canGoBack() ? router.back() : router.replace('/')) : undefined);
  return (
    <Tap
      haptic="light"
      accessibilityRole="button"
      onPress={handle}
      className={cn(
        'items-center justify-center rounded-full bg-surface active:opacity-80',
        className,
      )}
      style={[{ width: size, height: size }, style]}
      {...props}
    >
      {icon === 'back' ? (
        <BackIcon color={color} />
      ) : icon === 'close' ? (
        <CloseIcon color={color} />
      ) : (
        icon
      )}
    </Tap>
  );
}
