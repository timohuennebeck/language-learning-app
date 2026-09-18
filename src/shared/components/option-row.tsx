import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ring } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { RecommendedBadge } from '@/shared/ui/recommended-badge';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

type Props = {
  /** Number in the leading 46px circle (minutes, talks). */
  n: number;
  label: string;
  sub: string;
  /** Tabular digits in the sub line (prices). */
  tabularSub?: boolean;
  selected: boolean;
  onPress: () => void;
  /** Hangs the "Empfohlen" badge over the top-right corner and lifts the row above its siblings. */
  recommended?: boolean;
  /** Trailing content: bars, price, radio mark. */
  children?: ReactNode;
};

/** White selectable row with a number circle, label + sub line and trailing content. */
export function OptionRow({
  n,
  label,
  sub,
  tabularSub,
  selected,
  onPress,
  recommended,
  children,
}: Props) {
  return (
    <Tap
      haptic="selection"
      onPress={onPress}
      className="relative flex-row items-center rounded-[20px] bg-white px-[16px] py-[13px]"
      style={{
        columnGap: 13,
        boxShadow: selected ? ring(1.8, colors.accent[800]) : ring(1, colors.neutral[200]),
        zIndex: recommended ? 2 : 1,
      }}
    >
      {recommended ? <RecommendedBadge style={{ right: 18, top: -11 }} /> : null}
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
