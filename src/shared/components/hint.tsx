import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

type Props = {
  text: string;
  /** Glyph inside the 20px circle. */
  glyph?: '?' | 'i';
  align?: 'center' | 'start';
  className?: string;
};

/** Small surface circle with "?"/"i" followed by a muted sentence. */
export function Hint({ text, glyph = '?', align = 'center', className }: Props) {
  return (
    <View
      className={cn('flex-row', align === 'center' ? 'items-center' : 'items-start', className)}
      style={{ columnGap: 10 }}
    >
      <View
        className={cn(
          'h-[20px] w-[20px] items-center justify-center rounded-full bg-surface',
          align === 'start' && 'mt-[1px]',
        )}
      >
        <Text className="text-accent-800" style={{ fontSize: 12 }}>
          {glyph}
        </Text>
      </View>
      <Text
        className="flex-1 text-muted"
        style={{ fontSize: 14, lineHeight: align === 'start' ? 20.3 : undefined }}
      >
        {text}
      </Text>
    </View>
  );
}
