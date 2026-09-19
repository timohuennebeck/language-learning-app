import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BOX_COUNT } from '@/features/flashcards/lib/boxes';
import { useReadingBundle, useSaveWord } from '@/features/reading/hooks/use-reading';
import { confidence } from '@/features/reading/lib/tiers';
import { InlineFlow } from '@/shared/components/inline-flow';
import { InlineMark } from '@/shared/components/inline-mark';
import { insetRing } from '@/shared/lib/styles';
import { splitMarks } from '@/shared/lib/text';
import { colors } from '@/shared/theme/tokens';
import { Button, TextButton } from '@/shared/ui/button';
import { Kicker } from '@/shared/ui/kicker';
import { Screen } from '@/shared/ui/screen';
import { Spinner } from '@/shared/ui/spinner';
import { Text } from '@/shared/ui/text';
import { TopBar } from '@/shared/ui/top-bar';

/**
 * 16a · one word from the text.
 *
 * It shows two meanings, and the difference between them is the point: `here` is what this exact
 * form means in this sentence ("ich bin gegangen"), the lexeme's gloss is the dictionary entry
 * ("aller · gehen"). The card the learner saves is the entry, so it comes back in every form.
 */
export function WordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ textId?: string; sentence?: string; at?: string }>();
  const { data: bundle, isPending } = useReadingBundle(params.textId);
  const save = useSaveWord();

  const sentence = bundle?.text.content?.sections
    .flatMap((s) => s.sentences)
    .find((s) => s.id === params.sentence);
  const span = sentence?.spans.find((s) => s.at === Number(params.at));
  const lexeme = span ? bundle?.lexemes[span.lexeme] : undefined;

  if (isPending || !bundle) {
    return (
      <Screen bottom={0} className="px-[20px]">
        <TopBar left="back" title={t('reading.title')} />
        <View className="flex-1 items-center justify-center">
          <Spinner />
        </View>
      </Screen>
    );
  }
  if (!sentence || !span || !lexeme) {
    return (
      <Screen bottom={0} className="px-[20px]">
        <TopBar left="back" title={t('reading.title')} />
        <Text className="mt-[24px] text-muted" style={{ fontSize: 16 }}>
          {t('reading.empty')}
        </Text>
      </Screen>
    );
  }

  const state = bundle.states[span.lexeme];
  const pct = confidence(state);
  const surface = sentence.source.slice(span.at, span.at + span.len);
  const saved = save.isSuccess || !!state;

  return (
    <Screen bottom={0} className="px-[20px]">
      <TopBar left="back" title={bundle.text.title ?? t('reading.title')} />
      <View className="mt-[22px] flex-row items-center" style={{ columnGap: 10 }}>
        <View className="rounded-pill bg-surface px-[12px] py-[5px]">
          <Text
            className="font-semibold text-accent-800"
            style={{ fontSize: 13, letterSpacing: 0.52 }}
          >
            {/* Three different things, and saying the wrong one is worse than saying nothing:
                no card at all, a card never practised, and a card with a track record. */}
            {!state
              ? t('word.new')
              : pct === null
                ? t('word.box', { n: state.box, total: BOX_COUNT })
                : t('word.sure', { pct: `${pct} %` })}
          </Text>
        </View>
        {state && pct !== null ? (
          <Text className="text-faint" style={{ fontSize: 13 }}>
            {t('word.note', { right: state.reviews - state.lapses, total: state.reviews })}
          </Text>
        ) : null}
      </View>

      <Text
        className="mt-[14px] font-semibold text-ink"
        style={{ fontSize: 34, lineHeight: 36.7, letterSpacing: -1.19 }}
      >
        {surface}
      </Text>
      <Text className="mt-[8px] text-sub" style={{ fontSize: 19 }}>
        {span.here}
      </Text>

      <View className="mt-[26px]" style={{ rowGap: 9 }}>
        <Kicker tracking={0.1} className="text-accent-700">
          {t('word.inSentence')}
        </Kicker>
        <InlineFlow
          textStyle={{ fontSize: 19, lineHeight: 28.9, color: colors.accent[900] }}
          pieces={[
            sentence.source.slice(0, span.at),
            {
              key: 'word',
              node: (
                <InlineMark size={19} color={colors.accent[900]} bg={colors.track} py={1}>
                  {surface}
                </InlineMark>
              ),
            },
            sentence.source.slice(span.at + span.len),
          ]}
        />
        <InlineFlow
          textStyle={{ fontSize: 14.5, lineHeight: 21, color: colors.muted }}
          pieces={splitMarks(sentence.native, span.nativeMarks).map((run, i) =>
            run.marked
              ? {
                  key: `native-${i}`,
                  node: (
                    <InlineMark
                      size={14.5}
                      lineHeight={18}
                      color={colors.accent[900]}
                      bg={colors.track}
                      radius={5}
                      px={3}
                      py={1}
                    >
                      {run.text}
                    </InlineMark>
                  ),
                }
              : run.text,
          )}
        />
      </View>

      <View className="mt-[24px]" style={{ rowGap: 9 }}>
        <Kicker tracking={0.1} className="text-accent-700">
          {t('word.dictionary')}
        </Kicker>
        <Text className="text-accent-900" style={{ fontSize: 17 }}>
          {lexeme.gender === 'm' ? 'le ' : lexeme.gender === 'f' ? 'la ' : ''}
          {lexeme.lemma}
          <Text className="text-muted" style={{ fontSize: 17 }}>
            {'  ·  '}
            {lexeme.trans}
          </Text>
        </Text>
        {lexeme.note ? (
          <Text className="text-muted" style={{ fontSize: 14.5, lineHeight: 21 }}>
            {lexeme.note}
          </Text>
        ) : null}
      </View>

      <View className="flex-1" />
      <View style={{ rowGap: 10 }}>
        <Button
          height={58}
          label={saved ? t('word.saved') : t('word.save')}
          variant={saved ? 'ghost-accent' : 'primary'}
          style={saved ? { boxShadow: insetRing(1.5, colors.accent[800]) } : undefined}
          haptic={saved ? 'light' : 'success'}
          disabled={saved || save.isPending}
          onPress={() => save.mutate(lexeme)}
        />
        <TextButton
          className="h-[52px]"
          label={t('word.continue')}
          color="text-accent-900"
          size={16.5}
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}
