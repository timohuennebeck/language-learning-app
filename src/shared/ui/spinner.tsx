import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/shared/theme/tokens';

const SIZE = 26;

interface Props {
  size?: number;
  /** Colour of the moving arc; the track stays the subtle line colour. */
  color?: string;
}

/** Rotating ring spinner (design: 26px, 2.5px border, accent top). */
export function Spinner({ size = SIZE, color = colors.accent[700] }: Props = {}) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(rot);
  }, [rot]);
  const anim = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2.5,
          borderColor: colors.line2,
          borderTopColor: color,
        },
        anim,
      ]}
    />
  );
}
