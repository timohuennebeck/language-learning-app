import {
  StyleSheet,
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { cn } from '@/shared/lib/cn';

export interface TextProps extends RNTextProps {
  className?: string;
}

/** Design body defaults: 15px Inter, line-height 1.55 (inherited by everything without its own). */
const BODY_SIZE = 15;
const BODY_LINE_HEIGHT = 1.55;

/**
 * Base text: Inter Regular, ink color. Weight is chosen via font-medium / font-semibold / font-bold.
 * When a style sets a font size without a line height, the design's 1.55 body ratio is applied so
 * rows, pills and buttons keep the same vertical rhythm as the HTML.
 */
export function Text({ className, style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const fontSize = flat?.fontSize ?? BODY_SIZE;
  const lineHeight = flat?.lineHeight ?? Math.round(fontSize * BODY_LINE_HEIGHT * 100) / 100;
  return (
    <RNText
      className={cn('font-regular text-text', className)}
      style={[{ fontSize, lineHeight }, style]}
      {...props}
    />
  );
}
