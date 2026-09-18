import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Illustration } from '@/shared/ui/illustration';
import { Text } from '@/shared/ui/text';

/** Small Pip + explanatory sentence in a surface2 card. */
export function PipTip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <View
      className={cn(
        'flex-row items-center rounded-[20px] bg-surface2 px-[16px] py-[14px]',
        className,
      )}
      style={{ columnGap: 12 }}
    >
      <Illustration name="pip-cheer-small" size={44} />
      <Text className="flex-1 text-sub" style={{ fontSize: 14.5, lineHeight: 20.3 }}>
        {children}
      </Text>
    </View>
  );
}

export function Strong({ children }: { children: ReactNode }) {
  return (
    <Text className="font-semibold" style={{ fontSize: 14.5, color: colors.ink3 }}>
      {children}
    </Text>
  );
}
