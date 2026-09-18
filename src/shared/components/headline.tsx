import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

type Props = {
  title: string;
  sub?: string;
  /** Onboarding: 33px / -.035em / 1.06. Profile: 30px / -.035em / 1.08. */
  size?: 33 | 30;
  className?: string;
  center?: boolean;
  titleMarginTop?: number;
};

const lineHeight: Record<NonNullable<Props['size']>, number> = { 33: 34.98, 30: 32.4 };

/** Screen headline + optional muted sub line, matching the design's semibold Inter title block. */
export function Headline({ title, sub, size = 33, className, center, titleMarginTop = 22 }: Props) {
  return (
    <View className={className} style={{ marginTop: titleMarginTop }}>
      <Text
        className={cn('font-semibold text-ink', center && 'text-center')}
        style={{ fontSize: size, lineHeight: lineHeight[size], letterSpacing: -0.035 * size }}
      >
        {title}
      </Text>
      {sub ? (
        <Text
          className={cn('mt-[12px] text-muted', center && 'text-center')}
          style={{ fontSize: 15.5, lineHeight: 22.5 }}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
