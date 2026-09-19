import { InlineMark } from '@/shared/components/inline-mark';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';

/**
 * Inline answer chip inside a sentence (green when correct, red + strikethrough when wrong).
 * A real View so the rounded background renders on native; place it as an `InlineFlow` piece.
 */
type Props = {
  text: string;
  ok: boolean;
  size: number;
  /** Total chip height; matches the task-phase gap box. */ height: number;
};

export function AnswerChip({ text, ok, size, height }: Props) {
  // Natural line height: extra leading would sit above the glyphs on iOS and sink the word.
  const lineHeight = size * 1.2;
  return (
    <InlineMark
      size={size}
      lineHeight={lineHeight}
      color={ok ? colors.ok.text : colors.err.text}
      bg={ok ? colors.ok.chip : colors.err.chip}
      radius={14}
      px={12}
      py={(height - lineHeight) / 2}
      textClassName={cn(!ok && 'line-through')}
    >
      {text}
    </InlineMark>
  );
}
