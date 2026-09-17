import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/shared/theme/tokens';

type Props = { height?: number; color?: string; width?: number; style?: object };

/** Blinking text caret used in the typed-input mockups. */
export function Caret({ height = 22, color = colors.accent[700], width = 2, style }: Props) {
  const on = useSharedValue(1);
  useEffect(() => {
    on.value = withRepeat(
      withSequence(withTiming(1, { duration: 530 }), withTiming(0, { duration: 530 })),
      -1,
      false,
    );
  }, [on]);
  const anim = useAnimatedStyle(() => ({ opacity: on.value > 0.5 ? 1 : 0 }));
  return (
    <Animated.View
      style={[{ width, height, backgroundColor: color, borderRadius: 1 }, anim, style]}
    />
  );
}
