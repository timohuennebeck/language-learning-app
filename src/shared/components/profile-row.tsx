import type { ReactNode } from 'react';
import { CaretRightIcon } from 'phosphor-react-native';
import { View } from 'react-native';

import { colors } from '@/shared/theme/tokens';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

interface Props {
  label: string;
  sub?: string;
  value?: string;
  right?: ReactNode;
  /** Leading icon, e.g. the cog on the settings row. */
  left?: ReactNode;
  onPress?: () => void;
  /** Last row in a group: no divider below. */
  last?: boolean;
}

/** Settings row (label, optional sub/value, chevron) inside a rounded group. */
export function ProfileRow({ label, sub, value, right, left, onPress, last }: Props) {
  return (
    <>
      <Tap
        haptic="light"
        onPress={onPress}
        className="flex-row items-center px-[18px] py-[15px]"
        style={{ columnGap: 12 }}
      >
        {left}
        <View className="flex-1">
          <Text className="text-accent-900" style={{ fontSize: 16.5 }}>
            {label}
          </Text>
          {sub ? (
            <Text className="mt-[2px] text-muted" style={{ fontSize: 13.5 }}>
              {sub}
            </Text>
          ) : null}
        </View>
        {value ? (
          <Text className="text-muted" style={{ fontSize: 15.5 }}>
            {value}
          </Text>
        ) : null}
        {right}
        <CaretRightIcon size={12} color={colors.faint} weight="bold" />
      </Tap>
      {!last ? <View className="mx-[18px] h-[1px] bg-line" /> : null}
    </>
  );
}
