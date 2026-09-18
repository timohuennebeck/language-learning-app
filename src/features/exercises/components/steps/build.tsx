import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { StepProps } from '@/features/exercises/components/steps/types';
import { Hint } from '@/shared/components/hint';
import { colors } from '@/shared/theme/tokens';
import { DragHandle } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** Widths of the empty drop slots, cycled for however many pieces are still missing. */
const SLOT_WIDTHS = [104, 138, 126];

/** 19c1 / 25e / 25f · Übersetzen mit Bausteinen. */
export function Build({ step, phase, answer, setAnswer }: StepProps<'build', string[]>) {
  const { t } = useTranslation();
  const task = phase === 'task';
  const missing = Math.max(0, step.answer.length - answer.length);
  return (
    <>
      <Kicker size={12} style={{ marginTop: task ? 28 : 26 }}>
        {t('exercise.translate')}
      </Kicker>
      <Text
        className="text-ink"
        style={{
          fontSize: task ? 24 : 21,
          lineHeight: (task ? 24 : 21) * 1.4,
          letterSpacing: task ? -0.24 : 0,
          marginTop: 12,
        }}
      >
        {step.prompt}
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: 8, marginTop: task ? 24 : 16 }}>
        {answer.map((piece, i) => {
          if (!task) {
            const wrong = piece === step.wrongPiece && phase === 'wrong';
            return (
              <View
                key={piece + i}
                className="rounded-[14px] px-[13px] py-[9px]"
                style={{
                  backgroundColor: wrong ? colors.err.chip : colors.ok.chip,
                  boxShadow: wrong ? `inset 0 0 0 2px ${colors.err.ring}` : undefined,
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
              onPress={() => setAnswer(answer.filter((_, j) => j !== i))}
              className="flex-row items-center rounded-[14px] bg-white px-[14px] py-[10px]"
              style={{ columnGap: 8, boxShadow: '0 0 0 1px #e4e7f5' }}
            >
              <DragHandle color={colors.dim5} />
              <Text className="text-accent-900" style={{ fontSize: 18 }}>
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
                  height: 44,
                  backgroundColor: '#e9ebf9',
                  boxShadow: i === 0 ? `inset 0 0 0 1.5px ${colors.accent[500]}` : undefined,
                }}
              />
            ))
          : null}
      </View>
      {task ? (
        <>
          <Hint text={t('exercise.hintDrop')} className="mt-[12px]" />
          <View className="flex-row flex-wrap" style={{ gap: 10, marginTop: 26 }}>
            {step.pool.map((piece) => {
              const used = answer.includes(piece);
              return (
                <Tap
                  key={piece}
                  haptic="selection"
                  disabled={used}
                  onPress={() => setAnswer([...answer, piece])}
                  className="flex-row items-center rounded-[14px] px-[16px] py-[11px]"
                  style={{ columnGap: 8, backgroundColor: used ? colors.surface2 : colors.surface }}
                >
                  <DragHandle color={used ? colors.track2 : colors.dim4} />
                  <Text style={{ fontSize: 18, color: used ? colors.dim6 : colors.accent[900] }}>
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
