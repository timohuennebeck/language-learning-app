import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  size: number;
  stroke: number;
  /** 0..1 */
  progress: number;
  trackColor: string;
  color: string;
  children?: React.ReactNode;
  linecap?: 'round' | 'butt';
}

/** Circular progress ring, drawn from 12 o'clock clockwise. */
export function Ring({
  size,
  stroke,
  progress,
  trackColor,
  color,
  children,
  linecap = 'round',
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap={linecap}
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - pct)}
        />
      </Svg>
      {children}
    </View>
  );
}
