import { Image, type ImageProps } from 'expo-image';
import { View } from 'react-native';

import { insetRing, ring } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';

/** Registry of design illustrations (Pip mascot artwork, flags, avatar). */
const illustrations = {
  'pip-cheer-1': require('@assets/illustrations/pip-cheer-1.webp'),
  'pip-cheer-2': require('@assets/illustrations/pip-cheer-2.webp'),
  'pip-cheer-3': require('@assets/illustrations/pip-cheer-3.webp'),
  'pip-cheer-4': require('@assets/illustrations/pip-cheer-4.webp'),
  'pip-cheer-small': require('@assets/illustrations/pip-cheer-small.webp'),
  'pip-mic': require('@assets/illustrations/pip-mic.webp'),
  'pip-baguette': require('@assets/illustrations/pip-baguette.webp'),
  'pip-face': require('@assets/illustrations/pip-face.webp'),
  'pip-boxing': require('@assets/illustrations/pip-boxing.webp'),
  'pip-wave': require('@assets/illustrations/pip-wave.webp'),
  'pip-wave-2': require('@assets/illustrations/pip-wave-2.webp'),
  'pip-magnifier': require('@assets/illustrations/pip-magnifier.webp'),
  'pip-trophy': require('@assets/illustrations/pip-trophy.webp'),
  'pip-trophy-2': require('@assets/illustrations/pip-trophy-2.webp'),
  'pip-key': require('@assets/illustrations/pip-key.webp'),
  'pip-wrong': require('@assets/illustrations/pip-wrong.webp'),
  'pip-clock': require('@assets/illustrations/pip-clock.webp'),
  'pip-clock-2': require('@assets/illustrations/pip-clock-2.webp'),
  'pip-headphones': require('@assets/illustrations/pip-headphones.webp'),
  'pip-stars': require('@assets/illustrations/pip-stars.webp'),
  'pip-grumpy': require('@assets/illustrations/pip-grumpy.webp'),
  'pip-book-pencil': require('@assets/illustrations/pip-book-pencil.webp'),
  'pip-pair': require('@assets/illustrations/pip-pair.webp'),
  'pip-heart': require('@assets/illustrations/pip-heart.webp'),
  'pip-glasses-book': require('@assets/illustrations/pip-glasses-book.webp'),
  'pip-dizzy': require('@assets/illustrations/pip-dizzy.webp'),
  'pip-door': require('@assets/illustrations/pip-door.webp'),
  'avatar-maja': require('@assets/illustrations/avatar-maja.webp'),
  'flag-de': require('@assets/flags/de.svg'),
  'flag-en': require('@assets/flags/en.svg'),
  'flag-es': require('@assets/flags/es.svg'),
  'flag-fr': require('@assets/flags/fr.svg'),
  'flag-it': require('@assets/flags/it.svg'),
  'flag-pt': require('@assets/flags/pt.svg'),
} as const;

export type IllustrationName = keyof typeof illustrations;
export type FlagCode = 'de' | 'en' | 'es' | 'fr' | 'it' | 'pt';

type Props = Omit<ImageProps, 'source'> & {
  name: IllustrationName;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
};

/** Renders a bundled illustration at a fixed size with `contain` fit. */
export function Illustration({
  name,
  size,
  width,
  height,
  style,
  contentFit = 'contain',
  ...props
}: Props) {
  const w = width ?? size;
  const h = height ?? size;
  return (
    <Image
      source={illustrations[name]}
      contentFit={contentFit}
      style={[{ width: w, height: h }, style]}
      accessibilityIgnoresInvertColors
      {...props}
    />
  );
}

/** 44px circular flag chip with the subtle inset ring from the design. */
export function Flag({
  code,
  size = 44,
  opacity = 1,
}: {
  code: FlagCode;
  size?: number;
  opacity?: number;
}) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', opacity }}
    >
      <Image
        source={illustrations[`flag-${code}`]}
        contentFit="cover"
        style={{ width: size, height: size }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: size / 2,
          boxShadow: insetRing(1, 'rgba(22,24,34,.1)'),
        }}
      />
    </View>
  );
}

/** Circular avatar with the 1.5px ring used in the app header and profile. */
export function Avatar({ size = 34 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        boxShadow: ring(1.5, colors.line2),
      }}
    >
      <Image
        source={illustrations['avatar-maja']}
        contentFit="cover"
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    </View>
  );
}
