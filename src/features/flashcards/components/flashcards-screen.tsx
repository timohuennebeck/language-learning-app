import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckIcon, XIcon } from 'phosphor-react-native';
import { Text as RNText, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { SwipeCard } from '@/features/flashcards/components/swipe-card';
import { useDeck, useSaveRun } from '@/features/flashcards/hooks/use-deck';
import { useSwipeDeck } from '@/features/flashcards/hooks/use-swipe-deck';
import { ring } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { Spinner } from '@/shared/ui/spinner';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

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
  const params = useLocalSearchParams<{ ids?: string }>();
  const deck = useDeck();
  const save = useSaveRun();
  // `?ids=` repeats a subset ("Die 23 gleich nochmal" from the results screen).
  const only = params.ids ? new Set(params.ids.split(',')) : null;
  const cards = (deck.data?.cards ?? []).filter((c) => !only || only.has(c.id));
  const d = useSwipeDeck(cards, ({ known, againIds }) => {
    // One write for the whole run: every card moves a box, or falls back to box 1.
    const again = new Set(againIds);
    save.mutate({
      cards,
      knownIds: new Set(cards.filter((c) => !again.has(c.id)).map((c) => c.id)),
    });
    router.replace({
      pathname: '/(app)/flashcards/done',
      params: { total: String(cards.length), known: String(known), ids: againIds.join(',') },
    });
  });
  // `isPending` also covers the query that has not started yet (no user id), hence fetchStatus.
  const loading = deck.isPending && deck.fetchStatus !== 'idle';
  // Worklets copy every captured value to the UI thread; capturing `d` would copy the gesture too.
  const { dx } = d;

  const leftHint = useAnimatedStyle(() => ({
    color: dx.value < -40 ? colors.sub : colors.neutral[400],
  }));
  const rightHint = useAnimatedStyle(() => ({
    color: dx.value > 40 ? colors.accent[700] : colors.neutral[400],
  }));

  return (
    <Screen bottom={6} className="px-[22px]">
      <TopBar
        left="close"
        title={t('flashcards.title')}
        titleSize={20}
        right={
          cards.length ? (
            <Text className="text-sub" style={{ fontSize: 15, fontVariant: ['tabular-nums'] }}>
              {Math.min(d.index + 1, cards.length)} / {cards.length}
            </Text>
          ) : null
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
      {/* The card owns the whole area between the labels and the two buttons. */}
      <View className="relative mt-[6px] flex-1" style={{ minHeight: 0 }}>
        {d.index + 1 < cards.length ? (
          <View
            className="absolute rounded-[26px] bg-surface2"
            style={{
              top: 4,
              left: 32,
              right: 32,
              bottom: 20,
              boxShadow: ring(1, colors.neutral[200]),
            }}
          />
        ) : null}
        {d.card ? (
          <SwipeCard
            card={d.card}
            flipped={d.flipped}
            gesture={d.gesture}
            dx={d.dx}
            leaving={d.leaving}
          />
        ) : null}
        {!d.card && (loading || deck.error || !cards.length) ? (
          <View className="flex-1 items-center justify-center px-[30px]">
            {loading ? (
              <Spinner />
            ) : (
              <Text className="text-center text-muted" style={{ fontSize: 17 }}>
                {deck.error ? t('flashcards.error') : t('flashcards.empty')}
              </Text>
            )}
          </View>
        ) : null}
      </View>
      <View className="flex-row items-center justify-center pt-[18px]" style={{ columnGap: 28 }}>
        <Tap
          haptic="light"
          onPress={() => d.flyOut(-1)}
          disabled={!d.card}
          accessibilityLabel={t('flashcards.again')}
          className="h-[68px] w-[68px] items-center justify-center rounded-full bg-surface"
        >
          <XIcon size={26} color={colors.sub} weight="regular" />
        </Tap>
        <View style={{ width: 80 }} />
        <Tap
          haptic="success"
          onPress={() => d.flyOut(1)}
          disabled={!d.card}
          accessibilityLabel={t('flashcards.known')}
          className="h-[68px] w-[68px] items-center justify-center rounded-full bg-accent-800"
        >
          <CheckIcon size={26} color={colors.accent[100]} weight="regular" />
        </Tap>
      </View>
    </Screen>
  );
}
