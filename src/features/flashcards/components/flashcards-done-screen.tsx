import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { demoResult } from '@/features/flashcards/data/content';
import type { DeckResult } from '@/features/flashcards/data/schemas';
import { useDeck } from '@/features/flashcards/hooks/use-deck';
import { GradientHeader } from '@/shared/components/gradient-header';
import { useBack } from '@/shared/hooks/use-back';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Illustration } from '@/shared/ui/illustration';
import { Kicker } from '@/shared/ui/kicker';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

/** Cards missed this often are drawn as filled chips. */
const EMPHASIS_AT = 3;

function Chip({ word, misses }: { word: string; misses: number }) {
  const { t } = useTranslation();
  const strong = misses >= EMPHASIS_AT;
  return (
    <View
      className={cn(
        'flex-row items-center rounded-pill px-[15px]',
        strong ? 'bg-accent-800' : 'bg-white',
      )}
      style={{
        height: 41,
        columnGap: 5,
        boxShadow: strong ? undefined : `0 0 0 1.5px ${colors.line2}`,
      }}
    >
      <Text className={strong ? 'text-accent-100' : 'text-ink'} style={{ fontSize: 18 }}>
        {word}
      </Text>
      <Text className={strong ? 'text-lilac' : 'text-faint'} style={{ fontSize: 18 }}>
        {t('flashcards.result.times', { n: misses })}
      </Text>
    </View>
  );
}

/** 41b · Karteikarten · Stapel geschafft (all repeat cards as chips, scrollable). */
export function FlashcardsDoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const back = useBack('/(app)');
  const params = useLocalSearchParams<{ total?: string; known?: string; ids?: string }>();
  const deck = useDeck('cafe');

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
        .map((c) => ({ id: c.id, word: c.front, misses: c.misses + 1 }))
        .sort((a, b) => b.misses - a.misses),
    };
  }
  const againCount = result.againCount ?? result.again.length;
  const againIds = result.again.map((c) => c.id).join(',');

  return (
    <Screen
      edgeToEdgeTop
      bottom={-10}
      className="px-[22px]"
      footer={
        <View style={{ rowGap: 6 }}>
          {result.again.length ? (
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
      }
    >
      <GradientHeader left="close" onLeftPress={back} className="-mx-[22px]" paddingBottom={30}>
        <View className="mt-[10px] w-full flex-row items-center" style={{ columnGap: 20 }}>
          <Illustration name="pip-trophy" size={82} />
          <View className="flex-1">
            <Kicker size={13}>{t('flashcards.result.kicker')}</Kicker>
            <Text
              className="mt-[6px] font-semibold text-ink"
              style={{ fontSize: 33, lineHeight: 37, letterSpacing: -0.99 }}
            >
              {t('flashcards.result.title', { n: result.total })}
            </Text>
            <Text className="mt-[6px] text-muted" style={{ fontSize: 18 }}>
              {t('flashcards.result.sub', { known: result.known, again: againCount })}
            </Text>
          </View>
        </View>
      </GradientHeader>
      <Kicker size={14} tracking={0.1} className="mt-[34px] text-muted">
        {t('flashcards.result.againTitle')}
      </Kicker>
      <Text className="mt-[8px] text-faint" style={{ fontSize: 15.5, lineHeight: 21.5 }}>
        {t('flashcards.result.againSub')}
      </Text>
      <View className="mt-[22px] flex-row flex-wrap" style={{ gap: 10, paddingBottom: 12 }}>
        {result.again.map((c) => (
          <Chip key={c.id} word={c.word} misses={c.misses} />
        ))}
      </View>
    </Screen>
  );
}
