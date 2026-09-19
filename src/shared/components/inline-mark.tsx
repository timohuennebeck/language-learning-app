import type { ReactNode } from 'react';
import { View, type PressableProps } from 'react-native';

import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

type Props = {
  children: ReactNode;
  /** Font size of the word; the line height defaults to 1.3× so the box hugs the glyphs. */
  size: number;
  lineHeight?: number;
  color: string;
  bg?: string;
  /** Ring drawn with a box shadow (see `ring` / `insetRing` in `@/shared/lib/styles`). */
  ring?: string;
  radius?: number;
  px?: number;
  py?: number;
  textClassName?: string;
  /** When set the mark is a `Tap` (selection haptic, click sound unless `sound="none"`). */
  onPress?: () => void;
  sound?: 'click' | 'none';
  accessibilityState?: PressableProps['accessibilityState'];
};

/**
 * A word or phrase in a rounded box, placed as an `InlineFlow` piece: reading segments, the
 * highlighted translation on the word screen, feedback marks and answer chips.
 */
export function InlineMark({
  children,
  size,
  lineHeight = size * 1.3,
  color,
  bg,
  ring,
  radius = 6,
  px = 4,
  py = 0,
  textClassName,
  onPress,
  sound,
  accessibilityState,
}: Props) {
  const style = {
    borderRadius: radius,
    paddingHorizontal: px,
    paddingVertical: py,
    backgroundColor: bg,
    boxShadow: ring,
  };
  const text = (
    <Text className={textClassName} style={{ fontSize: size, lineHeight, color }}>
      {children}
    </Text>
  );
  if (!onPress) return <View style={style}>{text}</View>;
  return (
    <Tap
      haptic="selection"
      sound={sound}
      onPress={onPress}
      accessibilityState={accessibilityState}
      style={style}
    >
      {text}
    </Tap>
  );
}
