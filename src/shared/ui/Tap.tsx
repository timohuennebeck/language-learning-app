import { Pressable, type PressableProps } from 'react-native';

import { haptic, type HapticKind } from '@/shared/lib/haptics';

export type TapProps = Omit<PressableProps, 'className'> & {
  className?: string;
  /** Haptic fired on press. Defaults to a light impact; use `none` for purely visual taps. */
  haptic?: HapticKind;
};

/** Pressable that fires Expo haptic feedback on press. Every tappable element should use it. */
export function Tap({ haptic: kind = 'light', onPress, ...props }: TapProps) {
  return (
    <Pressable
      onPress={(e) => {
        haptic(kind);
        onPress?.(e);
      }}
      {...props}
    />
  );
}
