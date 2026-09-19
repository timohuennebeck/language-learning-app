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

/** One bar pulsing between 25% and 100% of its height; bars get slightly different tempos. */
function Bar({ h, w, index }: { h: number; w: number; index: number }) {
  const duration = (0.7 + (index % 5) * 0.15) * 1000;
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [duration, s]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scaleY: s.value }] }));
  return (
    <Animated.View
      style={[{ width: w, height: h, borderRadius: w, backgroundColor: colors.accent[800] }, anim]}
    />
  );
}

/** Animated 17-bar audio waveform (3px bars, accent-800). */
export function Waveform() {
  return (
    <View className="flex-row items-center" style={{ columnGap: 3 }}>
      {HEIGHTS_MAIN.map((h, i) => (
        <Bar key={i} h={h} w={3} index={i} />
      ))}
    </View>
  );
}

/** 5-bar mini waveform used as a "speaking" kicker glyph. */
export function MiniWaveform() {
  return (
    <View className="flex-row items-center" style={{ columnGap: 2, height: 14 }}>
      {HEIGHTS_MINI.map((h, i) => (
        <Bar key={i} h={h} w={2} index={i} />
      ))}
    </View>
  );
}
