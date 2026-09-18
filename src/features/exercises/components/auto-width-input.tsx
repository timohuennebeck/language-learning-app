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
};

/**
 * Single-line text input whose width follows its content. The value is drawn by a regular Text
 * (which sizes the box in the same layout pass, so nothing jumps) and the real input is a
 * transparent overlay on top of it. The native caret is hidden so the design's blinking `Caret`
 * can sit right after the text.
 */
export function AutoWidthInput({
  value,
  onChangeText,
  fontSize,
  lineHeight,
  color = colors.accent[900],
  autoCapitalize = 'none',
  ...props
}: Props) {
  return (
    <View style={{ maxWidth: '100%' }}>
      <Text numberOfLines={1} style={{ fontSize, lineHeight, color }}>
        {value || ' '}
      </Text>
      <TextInput
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
