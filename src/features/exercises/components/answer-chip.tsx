import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Text } from '@/shared/ui/text';

/**
 * Inline answer chip inside a sentence (green when correct, red + strikethrough when wrong).
 * Rendered as a View inside the sentence Text: native Text cannot draw a rounded background.
 */
export function AnswerChip({ text, ok, size }: { text: string; ok: boolean; size: number }) {
  return (
    <View
      style={{
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 2,
        backgroundColor: ok ? colors.ok.chip : colors.err.chip,
        transform: [{ translateY: size * 0.16 }],
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
