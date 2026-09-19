import type { ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

import { ring } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

interface Props {
  /** Number in the leading 46px circle (minutes, talks). */
  n: number;
  label: string;
  sub: string;
  /** Tabular digits in the sub line (prices). */
  tabularSub?: boolean;
  selected: boolean;
  onPress: () => void;
  /** Lets the list measure this row (to hang the "Empfohlen" badge over it). */
  onLayout?: (e: LayoutChangeEvent) => void;
  /** Trailing content: bars, price, radio mark. */
  children?: ReactNode;
}

/** White selectable row with a number circle, label + sub line and trailing content. */
export function OptionRow({
  n,
  label,
  sub,
  tabularSub,
  selected,
  onPress,
  onLayout,
  children,
}: Props) {
  return (
    <Tap
      haptic="selection"
      onPress={onPress}
      onLayout={onLayout}
      className="flex-row items-center rounded-[20px] bg-white px-[16px] py-[13px]"
      style={{
        columnGap: 13,
        boxShadow: selected ? ring(1.8, colors.accent[800]) : ring(1, colors.neutral[200]),
      }}
    >
      <View
        className="h-[46px] w-[46px] items-center justify-center rounded-full"
        style={{ backgroundColor: selected ? colors.surface : colors.surface2 }}
      >
        <Text
          className="font-semibold text-accent-900"
          style={{ fontSize: 19, fontVariant: ['tabular-nums'] }}
        >
          {n}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-ink" style={{ fontSize: 16.5 }}>
          {label}
        </Text>
        <Text
          className="mt-[3px] text-faint"
          style={{ fontSize: 13.5, fontVariant: tabularSub ? ['tabular-nums'] : undefined }}
        >
          {sub}
        </Text>
      </View>
      {children}
    </Tap>
  );
}
