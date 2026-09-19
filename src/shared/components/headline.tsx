import { View } from 'react-native';

import { Text } from '@/shared/ui/text';

type Props = {
  title: string;
  sub?: string;
  /** Onboarding: 33px / -.035em / 1.06. Profile: 30px / -.035em / 1.08. */
  size?: 33 | 30;
  titleMarginTop?: number;
};

const lineHeight: Record<NonNullable<Props['size']>, number> = { 33: 34.98, 30: 32.4 };

/** Screen headline + optional muted sub line, matching the design's semibold Inter title block. */
export function Headline({ title, sub, size = 33, titleMarginTop = 22 }: Props) {
  return (
    <View style={{ marginTop: titleMarginTop }}>
      <Text
        className="font-semibold text-ink"
        style={{ fontSize: size, lineHeight: lineHeight[size], letterSpacing: -0.035 * size }}
      >
        {title}
      </Text>
      {sub ? (
        <Text className="mt-[12px] text-muted" style={{ fontSize: 15.5, lineHeight: 22.5 }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
