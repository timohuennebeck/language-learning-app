import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckIcon, XIcon } from 'phosphor-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SwipeCard } from '@/features/flashcards/components/swipe-card';
import { useDeck } from '@/features/flashcards/hooks/use-deck';
import { useSwipeDeck } from '@/features/flashcards/hooks/use-swipe-deck';
import { colors } from '@/shared/theme/tokens';
import { Screen } from '@/shared/ui/screen';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/** 04 · Karteikarten · Karte ziehen (swipe right = known, left = again, tap = flip). */
export function FlashcardsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ ids?: string }>();
  const deck = useDeck('cafe');
  // `?ids=` repeats a subset ("Die 23 gleich nochmal" from the results screen).
  const only = params.ids ? new Set(params.ids.split(',')) : null;
  const cards = (deck.data?.cards ?? []).filter((c) => !only || only.has(c.id));
  const d = useSwipeDeck(cards, ({ known, againIds }) =>
    router.replace({
      pathname: '/(app)/flashcards/done',
      params: { total: String(cards.length), known: String(known), ids: againIds.join(',') },
    }),
  );

  return (
    <Screen bottom={6} className="px-[22px]">
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
      {/* The card owns the whole area between the progress bar and the two buttons. */}
      <View className="relative mt-[10px] flex-1" style={{ minHeight: 0 }}>
        {d.index + 1 < cards.length ? (
          <View
            className="absolute rounded-[26px]"
            style={{
              top: 4,
              left: 32,
              right: 32,
              bottom: 20,
              backgroundColor: colors.accent[700],
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
