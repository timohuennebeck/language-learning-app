import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ReadingBundle, Sentence, Span } from '@/features/reading/data/types';
import { useMarkSectionRead, useReadingBundle } from '@/features/reading/hooks/use-reading';
import { tierOf } from '@/features/reading/lib/tiers';
import { InlineFlow, type FlowPiece } from '@/shared/components/inline-flow';
import { InlineMark } from '@/shared/components/inline-mark';
import { useGoToCourse } from '@/shared/hooks/use-back';
import { insetRing } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Kicker } from '@/shared/ui/kicker';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Screen } from '@/shared/ui/screen';
import { Spinner } from '@/shared/ui/spinner';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

const BODY = { fontSize: 20.5, lineHeight: 35.3, color: colors.accent[900] } as const;
/** Tier 0 is the strongest tint: a word that is new or shaky (see lib/tiers.ts). */
const TIER_BG = ['#b5abfc', '#d2cefd', '#eae8fd'] as const;

/**
 * One sentence as `InlineFlow` pieces: the plain runs between the spans, and each span as a
 * tappable mark. The spans carry offsets into `source`, so the sentence is sliced rather than
 * reassembled — which is why the stored text stays a real string.
 */
function sentencePieces(
  sentence: Sentence,
  bundle: ReadingBundle,
  selected: string | null,
  onPress: (span: Span) => void,
): FlowPiece[] {
  const pieces: FlowPiece[] = [];
  let cursor = 0;
  sentence.spans.forEach((span, i) => {
    // A span whose word has no meaning loaded is left as plain text rather than a dead tap.
    const lexeme = bundle.lexemes[span.lexeme];
    if (span.at < cursor || !lexeme) return;
    if (span.at > cursor) pieces.push(sentence.source.slice(cursor, span.at));
    const key = `${sentence.id}-${i}`;
    const state = bundle.states[span.lexeme];
    const tier = tierOf(state);
    pieces.push({
      key,
      node: (
        <InlineMark
          size={BODY.fontSize}
          color={BODY.color}
          // Tinted when it is one of the section's chosen words, and whenever the learner has a
          // card for it — that second case is the whole point: the text shows what they know, so
          // a word drifts from strong to faint as it climbs the boxes.
          bg={span.mark || state ? TIER_BG[tier] : undefined}
          ring={selected === key ? insetRing(2, colors.accent[700]) : undefined}
          sound="none"
          px={3}
          py={1}
          onPress={() => onPress(span)}
        >
          {sentence.source.slice(span.at, span.at + span.len)}
        </InlineMark>
      ),
    });
    cursor = span.at + span.len;
  });
  if (cursor < sentence.source.length) pieces.push(sentence.source.slice(cursor));
  // Sentences run together into a paragraph.
  pieces.push(' ');
  return pieces;
}

/** 14a · Lesen. `?textId=` selects the text; the section the learner is on comes from the row. */
export function ReadingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const goToCourse = useGoToCourse();
  const { textId } = useLocalSearchParams<{ textId?: string }>();
  const { data: bundle, isPending } = useReadingBundle(textId);
  const markRead = useMarkSectionRead();
  // The text opens where the learner left off and the buttons take over from there; until they
  // press one there is no state to hold, which is why this is an override and not a copy.
  const [section, setSection] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const current = section ?? bundle?.text.currentSection ?? 1;
  const total = bundle?.text.sectionCount ?? 0;
  const pieces = useMemo(() => {
    if (!bundle?.text.content) return [];
    const sec = bundle.text.content.sections[current - 1];
    if (!sec) return [];
    return sec.sentences.flatMap((s) =>
      sentencePieces(s, bundle, selected, (span) => {
        setSelected(`${s.id}-${s.spans.indexOf(span)}`);
        router.push({
          pathname: '/(app)/reading/word',
          params: { textId: bundle.text.id, sentence: s.id, at: String(span.at) },
        });
      }),
    );
  }, [bundle, current, selected, router]);

  if (isPending || !bundle) {
    return (
      <Screen bottom={0} className="px-[22px]">
        <TopBar left="back" title={t('reading.title')} titleSize={20} />
        <View className="flex-1 items-center justify-center">
          <Spinner />
        </View>
      </Screen>
    );
  }

  const last = current >= total;
  return (
    <Screen bottom={0} className="relative px-[22px]">
      <TopBar left="back" title={t('reading.title')} titleSize={20} />
      {current === 1 ? (
        <View className="mt-[20px]">
          <Kicker tracking={0.1} className="text-accent-700">
            {t('reading.kicker')}
          </Kicker>
          <Text
            className="mt-[8px] font-semibold text-ink"
            style={{ fontSize: 27, lineHeight: 29.7, letterSpacing: -0.81 }}
          >
            {bundle.text.title}
          </Text>
          <Text className="mt-[8px] text-muted" style={{ fontSize: 14 }}>
            {t('reading.hint')}
          </Text>
        </View>
      ) : null}

      {pieces.length ? (
        <InlineFlow className="mt-[20px]" textStyle={BODY} pieces={pieces} />
      ) : (
        <Text className="mt-[20px] text-muted" style={{ fontSize: 16 }}>
          {t('reading.empty')}
        </Text>
      )}

      <View className="flex-1" />
      <View style={{ rowGap: 11 }}>
        <View className="flex-row items-center" style={{ columnGap: 10 }}>
          <ProgressBar className="flex-1" progress={total ? current / total : 0} radius={4} />
          <Text className="text-muted" style={{ fontSize: 14 }}>
            {t('reading.section', { n: current, total })}
          </Text>
        </View>
        <View className="flex-row items-center" style={{ columnGap: 12 }}>
          <Tap
            haptic="light"
            onPress={() => (current > 1 ? setSection(current - 1) : router.back())}
            className="h-[58px] w-[58px] items-center justify-center rounded-full bg-surface"
          >
            <ArrowLeftIcon size={22} color={colors.accent[900]} weight="bold" />
          </Tap>
          <Button
            className="flex-1"
            size={17.5}
            label={last ? t('reading.finish') : t('reading.continue')}
            onPress={() => {
              // Record the section they just read, then move on. The write is fire-and-forget:
              // losing a progress update is not worth blocking the reader over.
              markRead.mutate({ textId: bundle.text.id, section: current });
              if (last) goToCourse(1);
              else setSection(current + 1);
            }}
          />
        </View>
      </View>
    </Screen>
  );
}
