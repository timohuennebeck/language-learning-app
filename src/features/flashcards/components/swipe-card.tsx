import { View } from 'react-native';
import { GestureDetector, type ComposedGesture } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import type { Flashcard } from '@/features/flashcards/data/types';
import { cn } from '@/shared/lib/cn';
import { ring } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** Where the card sits inside the deck area; it runs all the way down to the two buttons. */
const CARD_FRAME = { top: 20, left: 16, right: 16, bottom: 0 } as const;

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

interface Props {
  card: Flashcard;
  /** Position of this card in the deck, checked against `activeIndex` on the UI thread. */
  index: number;
  flipped: boolean;
  gesture: ComposedGesture;
  dx: SharedValue<number>;
  leaving: SharedValue<number>;
  activeIndex: SharedValue<number>;
}

/** The draggable, flippable front card with its "Nochmal" / "Gewusst" stamps. */
export function SwipeCard({ card, index, flipped, gesture, dx, leaving, activeIndex }: Props) {
  const { t } = useTranslation();
  const cardStyle = useAnimatedStyle(() => {
    // Once the deck has moved on, this card stays gone: `dx` is back at zero for its successor.
    const active = activeIndex.value === index;
    const shift = active ? dx.value : 0;
    return {
      opacity: active ? 1 : 0,
      transform: [
        { translateX: shift },
        { rotate: `${active && leaving.value ? leaving.value * 18 : shift / 18}deg` },
      ],
    };
  });
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
            boxShadow: `${ring(1, colors.neutral[200])}, 0 6px 18px rgba(41,43,49,.10)`,
          },
          cardStyle,
        ]}
      >
        <View className="flex-1 justify-center" style={{ rowGap: 10 }}>
          <Text
            className="font-medium text-accent-900"
            style={{ fontSize: 40, lineHeight: 46, letterSpacing: -0.8 }}
          >
            {flipped ? card.back : card.front}
          </Text>
          {flipped ? (
            <Text className="text-sub" style={{ fontSize: 18, lineHeight: 26 }}>
              {card.front}
            </Text>
          ) : null}
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
