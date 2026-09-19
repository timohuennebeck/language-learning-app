import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSession } from '@/features/auth/hooks/use-session';
import { demoResult } from '@/features/flashcards/data/content';
import type { DeckResult } from '@/features/flashcards/data/types';
import { useDeck } from '@/features/flashcards/hooks/use-deck';
import { ResultHero } from '@/shared/components/result-hero';
import { useBack } from '@/shared/hooks/use-back';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Gradient } from '@/shared/ui/gradient';
import { Kicker } from '@/shared/ui/kicker';
import { NavCircle } from '@/shared/ui/nav-circle';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** 42d · Karteikarten · Stapel geschafft (ring, headline, the cards that went back to box 1). */
export function FlashcardsDoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const back = useBack('/(app)/(tabs)');
  const params = useLocalSearchParams<{ total?: string; known?: string; ids?: string }>();
  const deck = useDeck('cafe');
  const { session } = useSession();

  // Opened from a real run: build the result from the swiped cards; opened directly: design sample.
  let result: DeckResult = demoResult;
  if (params.total !== undefined) {
    const ids = params.ids ? params.ids.split(',') : [];
    const cards = deck.data?.cards ?? [];
    result = {
      total: Number(params.total) || 0,
      known: Number(params.known) || 0,
      again: ids
        .map((id) => cards.find((c) => c.id === id))
        .filter((c) => c !== undefined)
        .map((c) => ({ id: c.id, word: c.front })),
    };
  }
  const againCount = result.againCount ?? result.again.length;
  const againIds = result.again.map((c) => c.id).join(',');
  const progress = result.total ? result.known / result.total : 0;

  return (
    <Screen bottom={-10} className="px-[22px]">
      <View className="h-[40px] justify-center">
        <NavCircle icon="close" onPress={back} />
      </View>
      <ResultHero
        progress={progress}
        badge={t('flashcards.result.badge', { known: result.known, total: result.total })}
        title={t('flashcards.result.title', { name: session.name })}
        sub={t('flashcards.result.sub', { up: result.known, back: againCount })}
      />
      {result.again.length ? (
        <View className="mt-[30px] flex-1 overflow-hidden" style={{ minHeight: 120 }}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <Kicker size={13} tracking={0.1}>
              {t('flashcards.result.backToBox')}
            </Kicker>
            <View className="mt-[10px] flex-row flex-wrap" style={{ gap: 8 }}>
              {result.again.map((c) => (
                <View
                  key={c.id}
                  className="justify-center rounded-pill bg-surface px-[14px]"
                  style={{ height: 40 }}
                >
                  <Text className="text-ink" style={{ fontSize: 17 }}>
                    {c.word}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
          {/* Fade the list out towards the button so it reads as scrollable. */}
          <Gradient
            pointerEvents="none"
            colors={['rgba(243,245,254,0)', colors.bg]}
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 56 }}
          />
        </View>
      ) : (
        <View className="flex-1" />
      )}
      <View className="mt-[16px]" style={{ rowGap: 6 }}>
        {againCount ? (
          <Button
            height={58}
            size={17}
            label={t('flashcards.result.retry', { n: againCount })}
            onPress={() =>
              router.replace({ pathname: '/(app)/flashcards', params: { ids: againIds } })
            }
          />
        ) : null}
        <TextButton
          className="h-[44px]"
          label={t('flashcards.result.finish')}
          color="text-sub"
          size={16}
          onPress={back}
        />
      </View>
    </Screen>
  );
}
