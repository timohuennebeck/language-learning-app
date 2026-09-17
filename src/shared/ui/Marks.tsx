import { View, type ViewProps } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { CheckIcon } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/Tap';

type CheckCircleProps = ViewProps & {
  size?: number;
  bg?: string;
  color?: string;
  stroke?: number;
  iconSize?: number;
  className?: string;
};

/** Filled circle with a check mark (selected rows, completed steps). */
export function CheckCircle({
  size = 24,
  bg = colors.accent[700],
  color = '#fff',
  stroke = 2.6,
  iconSize,
  className,
  style,
  ...props
}: CheckCircleProps) {
  return (
    <View
      className={cn('items-center justify-center rounded-full', className)}
      style={[{ width: size, height: size, backgroundColor: bg }, style]}
      {...props}
    >
      <CheckIcon size={iconSize ?? Math.round(size * 0.54)} color={color} strokeWidth={stroke} />
    </View>
  );
}

type RadioProps = {
  selected: boolean;
  size?: number;
  /** Ring color when unselected. */
  ringColor?: string;
  ringWidth?: number;
  /** Fill color when selected. */
  bg?: string;
  checkColor?: string;
  checkStroke?: number;
  className?: string;
};

/** Radio indicator: empty inset ring, or filled circle with a check. */
export function RadioMark({
  selected,
  size = 24,
  ringColor = colors.ring,
  ringWidth = 1.5,
  bg = colors.accent[700],
  checkColor = '#fff',
  checkStroke = 2.6,
  className,
}: RadioProps) {
  if (!selected) {
    return (
      <View
        className={cn('rounded-full', className)}
        style={{ width: size, height: size, boxShadow: `inset 0 0 0 ${ringWidth}px ${ringColor}` }}
      />
    );
  }
  return (
    <CheckCircle
      size={size}
      bg={bg}
      color={checkColor}
      stroke={checkStroke}
      className={className}
    />
  );
}

type CheckboxProps = {
  checked: boolean;
  size?: number;
  radius?: number;
  bg?: string;
  border?: string;
  className?: string;
};

/** 26px rounded-square checkbox from the recap / wizard lists. */
export function Checkbox({
  checked,
  size = 26,
  radius = 7,
  bg = colors.accent[800],
  border = colors.faint,
  className,
}: CheckboxProps) {
  return (
    <View
      className={cn('items-center justify-center', className)}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        borderWidth: 1.5,
        borderColor: checked ? bg : border,
        backgroundColor: checked ? bg : 'transparent',
      }}
    >
      {checked ? <CheckIcon size={14} color={colors.accent[100]} strokeWidth={2} /> : null}
    </View>
  );
}

/** Pagination dots (active dot is a 16px pill). */
export function Dots({
  count,
  index,
  onPress,
  className,
  inactiveWidth = 8,
}: {
  count: number;
  index: number;
  onPress?: (i: number) => void;
  className?: string;
  inactiveWidth?: number;
}) {
  return (
    <View
      className={cn('flex-row items-center justify-center', className)}
      style={{ columnGap: 6 }}
    >
      {Array.from({ length: count }, (_, i) => (
        <Tap
          key={i}
          haptic="selection"
          onPress={() => onPress?.(i)}
          hitSlop={6}
          style={{
            height: 6,
            width: i === index ? 16 : inactiveWidth,
            borderRadius: 999,
            backgroundColor: i === index ? colors.accent[800] : colors.neutral[300],
          }}
        />
      ))}
    </View>
  );
}
