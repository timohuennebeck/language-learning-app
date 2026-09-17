import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/shared/theme/tokens';

const HEIGHTS_MAIN = [8, 14, 22, 30, 38, 26, 34, 18, 40, 24, 12, 30, 16, 22, 10, 14, 6];
const HEIGHTS_MINI = [6, 12, 8, 14, 7];

function Bar({
  h,
  w,
  color,
  delay,
  duration,
  animate,
}: {
  h: number;
  w: number;
  color: string;
  delay: number;
  duration: number;
  animate: boolean;
}) {
  const s = useSharedValue(1);
  useEffect(() => {
    if (!animate) return;
    s.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [animate, duration, s]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scaleY: s.value }] }));
  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius: w, backgroundColor: color, marginLeft: delay ? 0 : 0 },
        animate ? anim : null,
      ]}
    />
  );
}

/** Animated 17-bar audio waveform (3px bars, accent-800). */
export function Waveform({
  color = colors.accent[800],
  animate = true,
  gap = 3,
}: {
  color?: string;
  animate?: boolean;
  gap?: number;
}) {
  return (
    <View className="flex-row items-center" style={{ columnGap: gap }}>
      {HEIGHTS_MAIN.map((h, i) => (
        <Bar
          key={i}
          h={h}
          w={3}
          color={color}
          delay={i * 50}
          duration={(0.7 + (i % 5) * 0.15) * 1000}
          animate={animate}
        />
      ))}
    </View>
  );
}

/** 5-bar mini waveform used as a "speaking" kicker glyph. */
export function MiniWaveform({
  color = colors.accent[800],
  animate = true,
}: {
  color?: string;
  animate?: boolean;
}) {
  return (
    <View className="flex-row items-center" style={{ columnGap: 2, height: 14 }}>
      {HEIGHTS_MINI.map((h, i) => (
        <Bar
          key={i}
          h={h}
          w={2}
          color={color}
          delay={i * 50}
          duration={(0.7 + (i % 5) * 0.15) * 1000}
          animate={animate}
        />
      ))}
    </View>
  );
}
