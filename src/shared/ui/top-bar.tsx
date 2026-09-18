import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { NavCircle } from '@/shared/ui/nav-circle';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Text } from '@/shared/ui/text';

type TopBarProps = {
  title?: string;
  left?: 'back' | 'close' | ReactNode | null;
  right?: ReactNode;
  onLeftPress?: () => void;
  /** Title font size: 20 (large, "Lesen") or 16 (compact, "Profil"). */
  titleSize?: 16 | 20;
};

/** 40px tall bar: 40px left slot, centered title, 40px right slot. */
export function TopBar({ title, left = 'back', right, onLeftPress, titleSize = 16 }: TopBarProps) {
  return (
    <View className="h-[40px] flex-row items-center">
      <View className="w-[44px] items-start">
        {left === 'back' || left === 'close' ? (
          <NavCircle icon={left} onPress={onLeftPress} />
        ) : (
          left
        )}
      </View>
      <View className="flex-1 items-center">
        {title ? (
          <Text
            className="font-medium text-accent-900"
            style={{ fontSize: titleSize }}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
      </View>
      <View className="w-[44px] items-end">{right}</View>
    </View>
  );
}

type ProgressTopBarProps = {
  /** 0..1 */
  progress: number;
  label: string;
  onBack?: () => void;
  height?: number;
  labelSize?: number;
  trackColor?: string;
  /** Background of the back circle (white on gradient headers). */
  backBg?: string;
  className?: string;
};

/** Back circle + 6px progress bar + trailing counter ("3 von 13", "3 / 8"). */
export function ProgressTopBar({
  progress,
  label,
  onBack,
  height = 34,
  labelSize = 14.5,
  trackColor = colors.track,
  backBg,
  className,
}: ProgressTopBarProps) {
  return (
    <View className={cn('flex-row items-center', className)} style={{ height, columnGap: 12 }}>
      <NavCircle
        icon="back"
        onPress={onBack}
        style={backBg ? { backgroundColor: backBg } : undefined}
      />
      <ProgressBar progress={progress} className="flex-1" trackColor={trackColor} />
      <Text className="text-muted" style={{ fontSize: labelSize, fontVariant: ['tabular-nums'] }}>
        {label}
      </Text>
    </View>
  );
}
