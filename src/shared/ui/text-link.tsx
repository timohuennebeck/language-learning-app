import { useState } from 'react';
import type { GestureResponderEvent } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { haptic } from '@/shared/lib/haptics';
import { Text, type TextProps } from '@/shared/ui/text';

interface Props extends TextProps {
  onPress: (e: GestureResponderEvent) => void;
}

/**
 * Inline link inside flowing text (legal sentences). A touchable cannot sit mid-sentence, so this
 * is a Text that dims while pressed instead of showing the native highlight box.
 */
export function TextLink({ className, style, onPress, ...props }: Props) {
  const [pressed, setPressed] = useState(false);
  return (
    <Text
      accessibilityRole="link"
      suppressHighlighting
      className={cn('font-semibold text-accent-800', className)}
      style={[style, pressed && { opacity: 0.6 }]}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={(e) => {
        haptic('light');
        onPress(e);
      }}
      {...props}
    />
  );
}
