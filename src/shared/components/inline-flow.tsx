import type { ReactNode } from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { Text } from '@/shared/ui/text';

export type FlowPiece = string | { key: string; node: ReactNode };

type Props = {
  pieces: FlowPiece[];
  /** Applied to every plain word. Must include `fontSize` and `lineHeight`. */
  textStyle: TextStyle;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * A paragraph that mixes plain words with inline boxes (highlighted words, chips).
 * Native `Text` cannot draw padding or rounded corners on a nested span, so the text is laid out
 * as a wrapping row of words and the boxes are real Views. Spaces are kept at the end of each word.
 */
export function InlineFlow({ pieces, textStyle, className, style }: Props) {
  const items: ReactNode[] = [];
  pieces.forEach((piece, i) => {
    if (typeof piece !== 'string') {
      items.push(
        <View key={piece.key} style={{ height: textStyle.lineHeight, justifyContent: 'center' }}>
          {piece.node}
        </View>,
      );
      return;
    }
    // Keep each word with its trailing space so the row wraps at the same points as a paragraph.
    const words = piece.match(/\S+\s*|\s+/g) ?? [];
    words.forEach((w, j) => {
      items.push(
        <Text key={`${i}-${j}`} style={textStyle}>
          {w}
        </Text>,
      );
    });
  });
  return (
    <View className={className} style={[{ flexDirection: 'row', flexWrap: 'wrap' }, style]}>
      {items}
    </View>
  );
}
