import { View } from 'react-native';
import { GestureDetector, type ComposedGesture } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import type { Flashcard } from '@/features/flashcards/data/schemas';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** Card frame shared by the swipe card and the "done" card. */
export const CARD_FRAME = { top: 32, left: 26, right: 26, bottom: 128 } as const;

function Stamp({
  side,
  label,
  dx,
}: {
  side: 'left' | 'right';
  label: string;
  dx: SharedValue<number>;
}) {
  const right = side === 'right';
  const style = useAnimatedStyle(() => ({
    opacity: right
      ? dx.value > 0
        ? Math.min(dx.value / 110, 1)
        : 0
      : dx.value < 0
        ? Math.min(-dx.value / 110, 1)
        : 0,
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 22,
          [side]: 22,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderWidth: 2,
          borderColor: right ? colors.accent[600] : colors.faint,
          transform: [{ rotate: right ? '10deg' : '-10deg' }],
        },
        style,
      ]}
    >
      <Kicker
        size={13}
        tracking={0.06}
        className={cn('font-medium', right ? 'text-accent-700' : 'text-sub')}
      >
        {label}
      </Kicker>
    </Animated.View>
  );
}

type Props = {
  card: Flashcard;
  flipped: boolean;
  gesture: ComposedGesture;
  dx: SharedValue<number>;
  flip: SharedValue<number>;
  leaving: SharedValue<number>;
};

/** The draggable, flippable front card with its "Nochmal" / "Gewusst" stamps. */
export function SwipeCard({ card, flipped, gesture, dx, flip, leaving }: Props) {
  const { t } = useTranslation();
  const cardStyle = useAnimatedStyle(() => ({
    // `perspective` only takes effect as the first entry of a native transform list.
    transform: [
      { perspective: 1000 },
      { translateX: dx.value },
      { rotate: `${leaving.value ? leaving.value * 18 : dx.value / 18}deg` },
      { rotateY: `${flip.value}deg` },
    ],
  }));
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            ...CARD_FRAME,
            borderRadius: 26,
            backgroundColor: colors.surface,
            padding: 26,
            boxShadow: '0 0 0 1px #e4e7f5, 0 6px 18px rgba(41,43,49,.10)',
          },
          cardStyle,
        ]}
      >
        <View className="flex-1 justify-center" style={{ rowGap: 8 }}>
          <Text
            className="font-medium text-accent-900"
            style={{ fontSize: 40, lineHeight: 44, letterSpacing: -0.8 }}
          >
            {flipped ? card.back : card.front}
          </Text>
          <Text className="text-sub" style={{ fontSize: 17 }}>
            {flipped ? card.front : card.example}
          </Text>
        </View>
        <Text className="text-center text-muted" style={{ fontSize: 14 }}>
          {t('flashcards.flip')}
        </Text>
        <Stamp side="left" label={t('flashcards.again')} dx={dx} />
        <Stamp side="right" label={t('flashcards.known')} dx={dx} />
      </Animated.View>
    </GestureDetector>
  );
}
