import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Text } from '@/shared/ui/Text';

/** Inline answer chip inside a sentence (green when correct, red + strikethrough when wrong). */
export function AnswerChip({ text, ok, size }: { text: string; ok: boolean; size: number }) {
  return (
    <Text
      className={cn(!ok && 'line-through')}
      style={{
        fontSize: size,
        lineHeight: size * 1.4,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 2,
        backgroundColor: ok ? colors.ok.chip : colors.err.chip,
        color: ok ? colors.ok.text : colors.err.text,
      }}
    >
      {text}
    </Text>
  );
}
