import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Flag, type FlagCode } from '@/shared/ui/Illustration';
import { CheckCircle } from '@/shared/ui/Marks';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

type Props = {
  flag?: FlagCode;
  left?: ReactNode;
  label: string;
  sub?: string;
  selected?: boolean;
  onPress?: () => void;
  /** Not selectable yet (e.g. an interface language that has no translation). */
  disabled?: boolean;
  /** Ring color when selected (accent-700 in onboarding). */
  ringColor?: string;
  className?: string;
};

/** White rounded row with a flag, label and check used by every language picker. */
export function SelectRow({
  flag,
  left,
  label,
  sub,
  selected,
  onPress,
  disabled,
  ringColor = colors.accent[700],
  className,
}: Props) {
  return (
    <Tap
      haptic="selection"
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      className={cn('flex-row items-center rounded-[20px] bg-white', className)}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        boxShadow: selected ? `0 0 0 2px ${ringColor}` : `0 0 0 1px ${colors.neutral[200]}`,
        columnGap: 14,
      }}
    >
      {flag ? <Flag code={flag} /> : left}
      <View className="flex-1" style={{ rowGap: 2 }}>
        <Text className={cn('text-ink', selected && 'font-semibold')} style={{ fontSize: 17 }}>
          {label}
        </Text>
        {sub ? (
          <Text className="text-muted" style={{ fontSize: 13.5 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {selected ? <CheckCircle size={24} bg={ringColor} stroke={2.6} iconSize={13} /> : null}
    </Tap>
  );
}
