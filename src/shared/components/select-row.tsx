import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { ring } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Flag, type FlagCode } from '@/shared/ui/illustration';
import { CheckCircle } from '@/shared/ui/marks';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

type Props = {
  flag: FlagCode;
  label: string;
  sub?: string;
  selected?: boolean;
  onPress?: () => void;
  /** Not selectable yet (e.g. an interface language that has no translation). */
  disabled?: boolean;
};

/** White rounded row with a flag, label and check used by every language picker. */
export function SelectRow({ flag, label, sub, selected, onPress, disabled }: Props) {
  return (
    <Tap
      haptic="selection"
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      className="flex-row items-center rounded-[20px] bg-white"
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        boxShadow: selected ? ring(2, colors.accent[700]) : ring(1, colors.neutral[200]),
        columnGap: 14,
      }}
    >
      <Flag code={flag} />
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
      {selected ? <CheckCircle /> : null}
    </Tap>
  );
}
