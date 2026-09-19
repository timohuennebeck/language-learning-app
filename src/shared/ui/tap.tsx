import { Pressable, type PressableProps } from 'react-native';

import { haptic, type HapticKind } from '@/shared/lib/haptics';
import { playSound, type SoundKind } from '@/shared/lib/sounds';

export type TapProps = Omit<PressableProps, 'className'> & {
  className?: string;
  /** Haptic fired on press. Defaults to a light impact; use `none` for purely visual taps. */
  haptic?: HapticKind;
  /** Sound played on press. Selection taps (`haptic="selection"`) click by default; use `none` to mute. */
  sound?: SoundKind | 'none';
};

/** Pressable that fires haptic (and, for selections, sound) feedback on press. Every tappable element should use it. */
export function Tap({
  haptic: kind = 'light',
  sound = kind === 'selection' ? 'click' : 'none',
  onPress,
  accessibilityRole = 'button',
  ...props
}: TapProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      onPress={(e) => {
        haptic(kind);
        if (sound !== 'none') playSound(sound);
        onPress?.(e);
      }}
      {...props}
    />
  );
}
