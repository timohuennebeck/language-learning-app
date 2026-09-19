import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/shared/theme/tokens';
import { Text } from '@/shared/ui/text';

interface Props {
  placeholder: string;
  width?: number;
  height?: number;
}

/**
 * Lesson artwork slot: the design's empty placeholder (dashed ring, image glyph, caption) until
 * artwork is provided, so the grid keeps its look.
 */
export function IllustrationSlot({ placeholder, width = 110, height = 88 }: Props) {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-[12px] px-[6px] py-[12px]"
      style={{ width, height, backgroundColor: 'rgba(127,127,127,.08)', rowGap: 6 }}
    >
      <View
        pointerEvents="none"
        className="absolute inset-0 rounded-[12px]"
        style={{
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.accent[900],
          opacity: 0.35,
        }}
      />
      <Svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.accent[900]}
        strokeWidth={1.6}
        style={{ opacity: 0.45 }}
      >
        <Rect x="3" y="4" width="18" height="16" rx="2.5" />
        <Circle cx="8.5" cy="9.5" r="1.6" />
        <Path
          d="M21 16l-5.2-5.2a1.5 1.5 0 0 0-2.1 0L6 18.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text
        className="text-center font-medium text-accent-900"
        style={{
          fontSize: 13,
          lineHeight: 16.9,
          letterSpacing: 0.13,
          opacity: 0.75,
          maxWidth: '96%',
        }}
      >
        {placeholder}
      </Text>
    </View>
  );
}
