import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors } from '@/shared/theme/tokens';
import { ChevronRight } from '@/shared/ui/icons';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';

type Props = {
  label: string;
  sub?: string;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  /** Last row in a group: no divider below. */
  last?: boolean;
};

/** Settings row (label, optional sub/value, chevron) inside a rounded group. */
export function ProfileRow({ label, sub, value, right, onPress, last }: Props) {
  return (
    <>
      <Tap
        haptic="light"
        onPress={onPress}
        className="flex-row items-center px-[18px] py-[15px]"
        style={{ columnGap: 12 }}
      >
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
        <ChevronRight size={12} color={colors.faint} strokeWidth={3.6} />
      </Tap>
      {!last ? <View className="mx-[18px] h-[1px] bg-line" /> : null}
    </>
  );
}
