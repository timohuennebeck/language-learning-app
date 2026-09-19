import { View } from 'react-native';

import { colors } from '@/shared/theme/tokens';
import { Caret } from '@/shared/ui/caret';
import { Text } from '@/shared/ui/text';

interface Props {
  /** Up to six characters; missing trailing characters render as empty boxes. */
  value: string;
  /** Index of the box that shows the caret (redeem screen). */
  activeIndex?: number;
  variant: 'input' | 'display';
}

/** Two groups of three character boxes separated by a dot (redeem / share code). */
export function CodeBoxes({ value, activeIndex, variant }: Props) {
  const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? '');
  const isInput = variant === 'input';
  const box = (ch: string, i: number) => {
    const active = isInput && i === activeIndex;
    return (
      <View
        key={i}
        className="flex-1 items-center justify-center"
        style={
          isInput
            ? {
                height: 64,
                borderRadius: 18,
                backgroundColor: active ? colors.surface : colors.paper,
                borderWidth: active ? 2 : 1,
                borderColor: active ? colors.accent[700] : colors.line,
              }
            : { height: 58, borderRadius: 16, backgroundColor: colors.accent[800] }
        }
      >
        {active ? (
          <Caret height={28} color={colors.accent[800]} />
        ) : (
          <Text
            className={isInput ? 'font-semibold text-accent-900' : 'font-semibold text-accent-100'}
            style={{ fontSize: isInput ? 25 : 23 }}
          >
            {ch}
          </Text>
        )}
      </View>
    );
  };
  return (
    <View className="flex-row items-center" style={{ columnGap: 10 }}>
      <View className="flex-1 flex-row" style={{ columnGap: isInput ? 8 : 6 }}>
        {chars.slice(0, 3).map((c, i) => box(c, i))}
      </View>
      <View className="h-[8px] w-[8px] rounded-full bg-ring4" />
      <View className="flex-1 flex-row" style={{ columnGap: isInput ? 8 : 6 }}>
        {chars.slice(3).map((c, i) => box(c, i + 3))}
      </View>
    </View>
  );
}
