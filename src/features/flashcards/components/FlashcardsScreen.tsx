import { useRouter } from 'expo-router';
import { Text as RNText, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { DoneCard } from '@/features/flashcards/components/DoneCard';
import { SwipeCard } from '@/features/flashcards/components/SwipeCard';
import { useDeck } from '@/features/flashcards/hooks/useDeck';
import { useSwipeDeck } from '@/features/flashcards/hooks/useSwipeDeck';
import { colors } from '@/shared/theme/tokens';
import { Illustration } from '@/shared/ui/Illustration';
import { CheckIcon, CloseIcon } from '@/shared/ui/icons';
import { Screen } from '@/shared/ui/Screen';
import { Tap } from '@/shared/ui/Tap';
import { Text } from '@/shared/ui/Text';
import { TopBar } from '@/shared/ui/TopBar';

const AnimatedText = Animated.createAnimatedComponent(RNText);
const HINT = {
  fontFamily: 'Inter-Regular',
  fontSize: 12,
  letterSpacing: 1.44,
  textTransform: 'uppercase',
} as const;

/** 04 · Karteikarten · Karte ziehen (swipe right = known, left = again, tap = flip). */
export function FlashcardsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const deck = useDeck('cafe');
  const cards = deck.data?.cards ?? [];
  const d = useSwipeDeck(cards);
  const finished = !deck.isPending && !d.card;

  const leftHint = useAnimatedStyle(() => ({
    color: d.dx.value < -40 ? colors.sub : colors.neutral[400],
  }));
  const rightHint = useAnimatedStyle(() => ({
    color: d.dx.value > 40 ? colors.accent[700] : colors.neutral[400],
  }));

  return (
    <Screen top={0} bottom={6} className="px-[22px]">
      <TopBar
        left="close"
        title={t('flashcards.title')}
        titleSize={20}
        right={
          <Text className="text-sub" style={{ fontSize: 15, fontVariant: ['tabular-nums'] }}>
            {Math.min(d.index + 1, cards.length)} / {cards.length}
          </Text>
        }
      />
      <View className="mt-[14px] flex-row" style={{ columnGap: 4 }}>
        {cards.map((c, i) => (
          <View
            key={c.id}
            className="h-[4px] flex-1 rounded-[2px]"
            style={{
              backgroundColor:
                i < d.index
                  ? colors.accent[800]
                  : i === d.index
                    ? colors.accent[400]
                    : colors.neutral[200],
            }}
          />
        ))}
      </View>
      <View className="mt-[22px] flex-row justify-between">
        <AnimatedText style={[HINT, leftHint]}>{t('flashcards.left')}</AnimatedText>
        <AnimatedText style={[HINT, rightHint]}>{t('flashcards.right')}</AnimatedText>
      </View>
      <View className="relative mt-[14px] flex-1" style={{ minHeight: 0 }}>
        {d.index + 1 < cards.length ? (
          <View
            className="absolute rounded-[26px] bg-surface2"
            style={{ top: 16, left: 40, right: 40, bottom: 140, boxShadow: '0 0 0 1px #e4e7f5' }}
          />
        ) : null}
        {d.card ? (
          <SwipeCard
            card={d.card}
            flipped={d.flipped}
            gesture={d.gesture}
            dx={d.dx}
            flip={d.flip}
            leaving={d.leaving}
          />
        ) : finished ? (
          <DoneCard known={d.known} again={d.again} onRestart={d.restart} />
        ) : null}
        <View
          pointerEvents="none"
          className="absolute items-center"
          style={{ left: '50%', bottom: -6, marginLeft: -48 }}
        >
          <Illustration name="pip-cheer-2" size={96} />
        </View>
      </View>
      <View className="flex-row items-center justify-center pt-[6px]" style={{ columnGap: 28 }}>
        <Tap
          haptic="light"
          onPress={() => d.flyOut(-1)}
          disabled={!d.card}
          accessibilityLabel={t('flashcards.again')}
          className="h-[68px] w-[68px] items-center justify-center rounded-full bg-surface"
        >
          <CloseIcon size={26} color={colors.sub} strokeWidth={2.2} />
        </Tap>
        <View style={{ width: 80 }} />
        <Tap
          haptic="success"
          onPress={() => (d.card ? d.flyOut(1) : router.back())}
          disabled={!finished && !d.card}
          accessibilityLabel={d.card ? t('flashcards.known') : t('common.close')}
          className="h-[68px] w-[68px] items-center justify-center rounded-full bg-accent-800"
        >
          <CheckIcon size={26} color={colors.accent[100]} strokeWidth={2.2} />
        </Tap>
      </View>
    </Screen>
  );
}
