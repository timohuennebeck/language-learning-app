import { InlineMark } from '@/shared/components/inline-mark';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';

/**
 * Inline answer chip inside a sentence (green when correct, red + strikethrough when wrong).
 * A real View so the rounded background renders on native; place it as an `InlineFlow` piece.
 */
export function AnswerChip({ text, ok, size }: { text: string; ok: boolean; size: number }) {
  return (
    <InlineMark
      size={size}
      lineHeight={size * 1.4}
      color={ok ? colors.ok.text : colors.err.text}
      bg={ok ? colors.ok.chip : colors.err.chip}
      radius={14}
      px={12}
      py={2}
      textClassName={cn(!ok && 'line-through')}
    >
      {text}
    </InlineMark>
  );
}
