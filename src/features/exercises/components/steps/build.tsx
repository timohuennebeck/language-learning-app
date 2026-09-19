import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PROMPT, STEP_TOP } from '@/features/exercises/components/steps/layout';
import type { StepProps } from '@/features/exercises/components/steps/types';
import { Hint } from '@/shared/components/hint';
import { insetRing, ring } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Kicker } from '@/shared/ui/kicker';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** Widths of the empty slots, cycled for however many pieces are still missing. */
const SLOT_WIDTHS = [104, 138, 126];
/** Height of a slot and of a placed piece, so a line never changes height when a piece lands. */
const PIECE_HEIGHT = 46;

/** 19c1 / 25e / 25f · Übersetzen mit Bausteinen: tap a piece to place it, tap it again to remove. */
export function Build({ step, phase, answer, setAnswer }: StepProps<'build', string[]>) {
  const { t } = useTranslation();
  const task = phase === 'task';
  const missing = Math.max(0, step.answer.length - answer.length);
  return (
    <>
      <Kicker size={12} style={{ marginTop: STEP_TOP }}>
        {t('exercise.translate')}
      </Kicker>
      <Text style={{ ...PROMPT, marginTop: 12 }}>{step.prompt}</Text>
      <View className="flex-row flex-wrap" style={{ gap: 8, marginTop: 20 }}>
        {answer.map((piece, i) => {
          if (!task) {
            const wrong = piece === step.wrongPiece && phase === 'wrong';
            return (
              <View
                key={piece + i}
                className="justify-center rounded-[14px] px-[14px]"
                style={{
                  height: PIECE_HEIGHT,
                  backgroundColor: wrong ? colors.err.chip : colors.ok.chip,
                  boxShadow: wrong ? insetRing(2, colors.err.ring) : undefined,
                }}
              >
                <Text style={{ fontSize: 17, color: wrong ? colors.err.text : colors.ok.text }}>
                  {piece}
                </Text>
              </View>
            );
          }
          return (
            <Tap
              key={piece + i}
              haptic="selection"
              sound="none"
              onPress={() => setAnswer(answer.filter((_, j) => j !== i))}
              className="justify-center rounded-[14px] bg-white px-[14px]"
              style={{ height: PIECE_HEIGHT, boxShadow: ring(1, colors.neutral[200]) }}
            >
              <Text className="text-accent-900" style={{ fontSize: 17 }}>
                {piece}
              </Text>
            </Tap>
          );
        })}
        {task
          ? Array.from({ length: missing }, (_, i) => (
              <View
                key={i}
                className="rounded-[14px]"
                style={{
                  width: SLOT_WIDTHS[i % SLOT_WIDTHS.length],
                  height: PIECE_HEIGHT,
                  backgroundColor: colors.surface2,
                  boxShadow: i === 0 ? insetRing(1.5, colors.accent[500]) : undefined,
                }}
              />
            ))
          : null}
      </View>
      {task ? (
        <>
          <Hint text={t('exercise.hintPieces')} className="mt-[12px]" />
          <View className="flex-row flex-wrap" style={{ gap: 10, marginTop: 26 }}>
            {step.pool.map((piece) => {
              const used = answer.includes(piece);
              return (
                <Tap
                  key={piece}
                  haptic="selection"
                  sound="none"
                  disabled={used}
                  onPress={() => setAnswer([...answer, piece])}
                  className="rounded-[14px] px-[16px] py-[11px]"
                  style={{ backgroundColor: used ? colors.surface2 : colors.surface }}
                >
                  <Text style={{ fontSize: 17, color: used ? colors.dim6 : colors.accent[900] }}>
                    {piece}
                  </Text>
                </Tap>
              );
            })}
          </View>
        </>
      ) : null}
    </>
  );
}
