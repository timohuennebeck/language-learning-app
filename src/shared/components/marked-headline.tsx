import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

type Props = {
  pre?: string;
  mark: string;
  post?: string;
  /** Font size, line height and letter spacing for every word. */
  textStyle: TextStyle;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Headline with one highlighted phrase. Laid out as a wrapping row of words so the mark is a
 * real View with a rounded background (native Text cannot draw one) and can wrap to its own line.
 */
export function MarkedHeadline({
  pre = '',
  mark,
  post = '',
  textStyle,
  textClassName = 'font-semibold text-ink',
  style,
}: Props) {
  const words = (s: string) => s.split(' ').filter(Boolean);
  return (
    <View className="flex-row flex-wrap items-center" style={style}>
      {words(pre).map((w, i) => (
        <Text key={`a${i}`} className={textClassName} style={textStyle}>
          {w}{' '}
        </Text>
      ))}
      <View
        className="rounded-[8px] bg-lilac3"
        style={{ flexShrink: 0, paddingHorizontal: (textStyle.fontSize ?? 30) * 0.22 }}
      >
        <Text className={textClassName} style={textStyle}>
          {mark}
        </Text>
      </View>
      {/* The space after the mark is its own item so it stays on the mark's line when wrapping. */}
      {post ? (
        <Text className={textClassName} style={textStyle}>
          {' '}
        </Text>
      ) : null}
      {words(post).map((w, i) => (
        <Text key={`b${i}`} className={cn(textClassName)} style={textStyle}>
          {w}{' '}
        </Text>
      ))}
    </View>
  );
}
