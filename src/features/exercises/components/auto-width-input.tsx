import { useState } from 'react';
import { Platform, TextInput, View, type TextInputProps } from 'react-native';

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
 * Text input whose width follows its content (an invisible twin Text measures it).
 * The native caret is hidden so the design's blinking `Caret` can sit right after the text.
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
  const [w, setW] = useState(20);
  return (
    <View style={{ maxWidth: '100%' }}>
      <Text
        className="font-regular"
        style={{ fontSize, lineHeight, position: 'absolute', opacity: 0 }}
        onLayout={(e) => setW(Math.max(20, Math.ceil(e.nativeEvent.layout.width) + 2))}
      >
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
          { fontSize, lineHeight, padding: 0, width: w, maxWidth: '100%', color },
          // The design draws its own caret; hide the browser focus ring on web.
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
        ]}
        {...props}
      />
    </View>
  );
}
