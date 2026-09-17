import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';

type Props = {
  /** 0..1 */
  progress: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  radius?: number;
  className?: string;
};

export function ProgressBar({
  progress,
  height = 6,
  trackColor = colors.track,
  fillColor = colors.accent[700],
  radius = 999,
  className,
}: Props) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View
      className={cn('overflow-hidden', className)}
      style={{ height, backgroundColor: trackColor, borderRadius: radius }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: fillColor,
          borderRadius: radius,
        }}
      />
    </View>
  );
}
