import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { InlineFlow } from '@/shared/components/inline-flow';
import { Text } from '@/shared/ui/text';

interface Props {
  pre?: string;
  mark: string;
  post?: string;
  /** Font size, line height and letter spacing for every word. */
  textStyle: TextStyle;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
}

/** Every word followed by exactly one space, whatever the surrounding whitespace in the copy. */
const spaced = (s: string) =>
  s
    .split(' ')
    .filter(Boolean)
    .map((w) => `${w} `)
    .join('');

/** Headline with one highlighted phrase in a rounded box (an `InlineFlow` of semibold words). */
export function MarkedHeadline({
  pre = '',
  mark,
  post = '',
  textStyle,
  textClassName = 'font-semibold text-ink',
  style,
}: Props) {
  return (
    <InlineFlow
      style={style}
      textStyle={textStyle}
      textClassName={textClassName}
      pieces={[
        spaced(pre),
        {
          key: 'mark',
          node: (
            <View
              className="rounded-[8px] bg-lilac3"
              style={{ paddingHorizontal: (textStyle.fontSize ?? 30) * 0.22 }}
            >
              <Text className={textClassName} style={textStyle}>
                {mark}
              </Text>
            </View>
          ),
        },
        // The space after the mark is its own item so it stays on the mark's line when wrapping.
        post ? ` ${spaced(post)}` : '',
      ]}
    />
  );
}
