import { View } from 'react-native';

import { Text } from '@/shared/ui/text';

/** Surface pill with the live dot and the elapsed time ("Live · 02:14" on the call, "02:14" on the task page). */
export function CallTimer({ label }: { label: string }) {
  return (
    <View
      className="flex-row items-center rounded-pill bg-surface px-[14px] py-[8px]"
      style={{ columnGap: 8 }}
    >
      <View className="h-[7px] w-[7px] rounded-full bg-accent-600" />
      <Text className="text-accent-900" style={{ fontSize: 14, fontVariant: ['tabular-nums'] }}>
        {label}
      </Text>
    </View>
  );
}
