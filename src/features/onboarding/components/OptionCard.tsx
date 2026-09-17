import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { RadioMark } from '@/shared/ui/Marks';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

type Props = {
  badge: string;
  name: string;
  /** Plain sub text. */
  sub?: string;
  /** Accent-colored example appended after `sub` (unselected cards). */
  example?: string;
  tags?: string[];
  selected?: boolean;
  onPress?: () => void;
  nameSize?: 21 | 20;
  subSize?: 15 | 14.5;
};

/** Level option (surface card, or accent-800 when selected) from the level pickers. */
export function OptionCard({
  badge,
  name,
  sub,
  example,
  tags,
  selected,
  onPress,
  nameSize = 21,
  subSize = 15,
}: Props) {
  return (
    <Tap
      haptic="selection"
      onPress={onPress}
      className={cn(
        'rounded-[24px] px-[18px]',
        selected ? 'bg-accent-800 py-[15px]' : 'bg-surface py-[14px]',
      )}
    >
      <View className="flex-row items-center" style={{ columnGap: 10 }}>
        <View
          className="h-[32px] w-[32px] items-center justify-center rounded-full"
          style={{ backgroundColor: selected ? 'rgba(245,244,255,.16)' : colors.bg }}
        >
          <Text
            className={cn('font-semibold', selected ? 'text-accent-100' : 'text-accent-900')}
            style={{ fontSize: 13.5 }}
          >
            {badge}
          </Text>
        </View>
        <Text
          className={cn('flex-1 font-medium', selected ? 'text-accent-100' : 'text-accent-900')}
          style={{ fontSize: nameSize, letterSpacing: -0.02 * nameSize }}
        >
          {name}
        </Text>
        <RadioMark
          selected={!!selected}
          size={24}
          bg={colors.accent[100]}
          checkColor={colors.accent[800]}
          checkStroke={2.8}
        />
      </View>
      {sub || example ? (
        <Text
          className={cn('mt-[6px]', selected ? 'text-lilac2' : 'text-sub')}
          style={{ fontSize: subSize, lineHeight: subSize * 1.35 }}
        >
          {sub}
          {example ? (
            <Text className="text-accent-800" style={{ fontSize: subSize }}>
              {example}
            </Text>
          ) : null}
        </Text>
      ) : null}
      {tags?.length ? (
        <View className="mt-[11px] flex-row" style={{ columnGap: 6 }}>
          {tags.map((tag) => (
            <View
              key={tag}
              className="rounded-pill px-[11px] py-[5px]"
              style={{ backgroundColor: 'rgba(245,244,255,.16)' }}
            >
              <Text className="text-accent-100" style={{ fontSize: 13 }}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Tap>
  );
}
