import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Text } from '@/shared/ui/text';

/**
 * Inline answer chip inside a sentence (green when correct, red + strikethrough when wrong).
 * A real View so the rounded background renders on native; place it as an `InlineFlow` piece.
 */
export function AnswerChip({ text, ok, size }: { text: string; ok: boolean; size: number }) {
  return (
    <View
      style={{
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 2,
        backgroundColor: ok ? colors.ok.chip : colors.err.chip,
      }}
    >
      <Text
        className={cn(!ok && 'line-through')}
        style={{
          fontSize: size,
          lineHeight: size * 1.4,
          color: ok ? colors.ok.text : colors.err.text,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
