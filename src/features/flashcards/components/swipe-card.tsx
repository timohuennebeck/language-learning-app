import { View } from 'react-native';
import { GestureDetector, type ComposedGesture } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import type { Flashcard } from '@/features/flashcards/data/types';
import { BOX_COUNT } from '@/features/flashcards/lib/boxes';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** Where the card sits inside the deck area; it runs all the way down to the two buttons. */
const CARD_FRAME = { top: 20, left: 16, right: 16, bottom: 0 } as const;

/** The six boxes as a row of bars, filled up to the box this card is in. */
function BoxBar({ box }: { box: number }) {
  return (
    <View className="flex-row" style={{ columnGap: 5 }}>
      {Array.from({ length: BOX_COUNT }, (_, i) => (
        <View
          key={i}
          style={{
            width: 16,
            height: 4,
            borderRadius: 2,
            backgroundColor: i < box ? colors.accent[300] : colors.accent[700],
          }}
        />
      ))}
    </View>
  );
}

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
          top: 76,
          [side]: 22,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderWidth: 2,
          borderColor: right ? colors.accent[300] : colors.accent[500],
          transform: [{ rotate: right ? '10deg' : '-10deg' }],
        },
        style,
      ]}
    >
      <Kicker
        size={13}
        tracking={0.06}
        className={cn('font-medium', right ? 'text-accent-100' : 'text-accent-300')}
      >
        {label}
      </Kicker>
    </Animated.View>
  );
}

interface Props {
  card: Flashcard;
  flipped: boolean;
  gesture: ComposedGesture;
  dx: SharedValue<number>;
  leaving: SharedValue<number>;
}

/** The draggable, flippable front card with its "Nochmal" / "Gewusst" stamps. */
export function SwipeCard({ card, flipped, gesture, dx, leaving }: Props) {
  const { t } = useTranslation();
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dx.value },
      { rotate: `${leaving.value ? leaving.value * 18 : dx.value / 18}deg` },
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
            backgroundColor: colors.accent[800],
            padding: 26,
            boxShadow: '0 14px 32px rgba(41,43,49,.2)',
          },
          cardStyle,
        ]}
      >
        <View className="flex-row items-center justify-between">
          <Kicker size={12} className="text-lilac">
            {t('flashcards.box', { n: card.box, total: BOX_COUNT })}
          </Kicker>
          <BoxBar box={card.box} />
        </View>
        <View className="flex-1 justify-center" style={{ rowGap: 10 }}>
          <Text
            className="font-medium text-accent-100"
            style={{ fontSize: 40, lineHeight: 46, letterSpacing: -0.8 }}
          >
            {flipped ? card.back : card.front}
          </Text>
          <Text className="text-lilac" style={{ fontSize: 18, lineHeight: 26 }}>
            {flipped ? card.front : card.example}
          </Text>
        </View>
        <Text className="text-center text-accent-400" style={{ fontSize: 14 }}>
          {t('flashcards.flip')}
        </Text>
        <Stamp side="left" label={t('flashcards.again')} dx={dx} />
        <Stamp side="right" label={t('flashcards.known')} dx={dx} />
      </Animated.View>
    </GestureDetector>
  );
}
