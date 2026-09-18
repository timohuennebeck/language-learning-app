import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Illustration, type IllustrationName } from '@/shared/ui/illustration';
import { Text } from '@/shared/ui/text';

type Props = { name?: IllustrationName; placeholder: string; width?: number; height?: number };

/**
 * Lesson artwork slot. Renders the illustration when one is provided; otherwise the
 * design's empty placeholder (dashed ring, image glyph, caption) so the grid keeps its look.
 */
export function IllustrationSlot({ name, placeholder, width = 110, height = 88 }: Props) {
  if (name) return <Illustration name={name} width={width} height={height} />;
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-[12px] px-[6px] py-[12px]"
      style={{ width, height, backgroundColor: 'rgba(127,127,127,.08)', rowGap: 6 }}
    >
      <View
        pointerEvents="none"
        className="absolute inset-0 rounded-[12px]"
        style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#2b2741', opacity: 0.35 }}
      />
      <Svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2b2741"
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
