import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/shared/theme/tokens';

type Props = { size?: number; stroke?: number; trackColor?: string; color?: string };

/** Rotating ring spinner (design: 26px, 2.5px border, accent top). */
export function Spinner({
  size = 26,
  stroke = 2.5,
  trackColor = colors.line2,
  color = colors.accent[700],
}: Props) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);
  }, [rot]);
  const anim = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: trackColor,
          borderTopColor: color,
        },
        anim,
      ]}
    />
  );
}
