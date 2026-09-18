import { View, type ViewProps } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { insetRing } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { CheckIcon } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/tap';

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
  /** Check glyph size; defaults to 54% of the circle. */
  checkSize?: number;
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
  checkSize,
}: RadioProps) {
  if (!selected) {
    return (
      <View
        className="rounded-full"
        style={{ width: size, height: size, boxShadow: insetRing(ringWidth, ringColor) }}
      />
    );
  }
  return (
    <CheckCircle size={size} bg={bg} color={checkColor} stroke={checkStroke} iconSize={checkSize} />
  );
}

type CheckboxProps = {
  checked: boolean;
  bg?: string;
  className?: string;
};

/** 26px rounded-square (7px) checkbox from the recap / wizard lists. */
export function Checkbox({ checked, bg = colors.accent[800], className }: CheckboxProps) {
  return (
    <View
      className={cn('h-[26px] w-[26px] items-center justify-center rounded-[7px]', className)}
      style={{
        borderWidth: 1.5,
        borderColor: checked ? bg : colors.faint,
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
}: {
  count: number;
  index: number;
  onPress?: (i: number) => void;
  className?: string;
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
          accessibilityLabel={`${i + 1} / ${count}`}
          style={{
            height: 6,
            width: i === index ? 16 : 8,
            borderRadius: 999,
            backgroundColor: i === index ? colors.accent[800] : colors.neutral[300],
          }}
        />
      ))}
    </View>
  );
}
