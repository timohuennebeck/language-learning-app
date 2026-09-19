import type { Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { NO_OUTLINE } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Text } from '@/shared/ui/text';

type Props = Pick<TextInputProps, 'autoCapitalize' | 'onSubmitEditing' | 'returnKeyType'> & {
  value: string;
  onChangeText: (v: string) => void;
  fontSize: number;
  lineHeight: number;
  color?: string;
  ref?: Ref<TextInput>;
};

/**
 * Single-line text input whose width follows its content. The value is drawn by a regular Text
 * (which sizes the box in the same layout pass, so nothing jumps) and the real input is a
 * transparent overlay on top of it. The native caret is hidden so the design's blinking `Caret`
 * can sit right after the text. Long answers keep their tail (where the caret is) visible.
 */
export function AutoWidthInput({
  value,
  onChangeText,
  fontSize,
  lineHeight,
  color = colors.accent[900],
  autoCapitalize = 'none',
  ref,
  ...props
}: Props) {
  return (
    <View style={{ maxWidth: '100%' }}>
      <Text numberOfLines={1} ellipsizeMode="head" style={{ fontSize, lineHeight, color }}>
        {value || ' '}
      </Text>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        autoFocus
        caretHidden
        className="font-regular"
        style={[
          StyleSheet.absoluteFill,
          { fontSize, lineHeight, padding: 0, color: 'transparent' },
          NO_OUTLINE,
        ]}
        {...props}
      />
    </View>
  );
}
