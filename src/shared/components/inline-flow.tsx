import type { ReactNode } from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { Text } from '@/shared/ui/text';

export type FlowPiece = string | { key: string; node: ReactNode };

interface Props {
  pieces: FlowPiece[];
  /** Applied to every plain word. Must include `fontSize` and `lineHeight`. */
  textStyle: TextStyle;
  /** Class applied to every plain word (font face, color). */
  textClassName?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * A paragraph that mixes plain words with inline boxes (highlighted words, chips, inputs).
 * Native `Text` cannot draw padding or rounded corners on a nested span, so the text is laid out
 * as a wrapping row of words and the boxes are real Views. Spaces are kept at the end of each word.
 * A box taller than the line height makes its own line taller; the words on it stay centred.
 */
export function InlineFlow({ pieces, textStyle, textClassName, className, style }: Props) {
  const items: ReactNode[] = [];
  pieces.forEach((piece, i) => {
    if (typeof piece !== 'string') {
      items.push(
        <View
          key={piece.key}
          style={{ minHeight: textStyle.lineHeight, maxWidth: '100%', justifyContent: 'center' }}
        >
          {piece.node}
        </View>,
      );
      return;
    }
    // Keep each word with its trailing space so the row wraps at the same points as a paragraph.
    const words = piece.match(/\S+\s*|\s+/g) ?? [];
    words.forEach((w, j) => {
      const text = (
        <Text key={`${i}-${j}`} className={textClassName} style={textStyle}>
          {w}
        </Text>
      );
      const prev = items[items.length - 1];
      if (j === 0 && !w.trim() && prev && typeof pieces[i - 1] !== 'string') {
        // A space right after a box: glue it to the box so it can never start a wrapped line.
        items[items.length - 1] = (
          <View key={`${i}-${j}-glued`} style={{ flexDirection: 'row', alignItems: 'center' }}>
            {prev}
            {text}
          </View>
        );
        return;
      }
      items.push(text);
    });
  });
  return (
    <View
      className={className}
      style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }, style]}
    >
      {items}
    </View>
  );
}
