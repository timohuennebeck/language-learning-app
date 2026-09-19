import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AnswerChip } from '@/features/exercises/components/answer-chip';
import { SENTENCE, STEP_TOP } from '@/features/exercises/components/steps/layout';
import type { StepProps } from '@/features/exercises/components/steps/types';
import { InlineFlow } from '@/shared/components/inline-flow';
import { insetRing } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { CheckIcon, CloseIcon } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** 19a2 / 25a / 25b · Lücke mit Optionen. */
export function FillOptions({ step, phase, answer, setAnswer }: StepProps<'fill-options'>) {
  const { t } = useTranslation();
  const task = phase === 'task';
  return (
    <>
      <Kicker size={12} style={{ marginTop: STEP_TOP }}>
        {t('exercise.fill')}
      </Kicker>
      <InlineFlow
        style={{ marginTop: 12 }}
        textStyle={SENTENCE}
        pieces={[
          step.pre,
          {
            key: 'gap',
            node: task ? (
              <View
                style={{
                  minWidth: 130,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: answer ? colors.surface : colors.surface2,
                  boxShadow: insetRing(1.5, colors.accent[500]),
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 12,
                }}
              >
                {answer ? (
                  <Text className="text-accent-900" style={{ fontSize: SENTENCE.fontSize - 2 }}>
                    {answer}
                  </Text>
                ) : null}
              </View>
            ) : (
              <AnswerChip text={answer} ok={phase === 'correct'} size={SENTENCE.fontSize} />
            ),
          },
          step.post,
        ]}
      />
      <Text className="text-muted" style={{ fontSize: 15, marginTop: 12 }}>
        {step.translation}
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: 10, marginTop: 26 }}>
        {step.options.map((o) => {
          const isAnswer = o === step.answer;
          const isPicked = o === answer;
          let bg: string = colors.surface;
          let color: string = colors.accent[900];
          let ring: string | undefined;
          let icon: ReactNode = null;
          if (!task) {
            if (isAnswer) {
              bg = colors.ok.chip;
              color = colors.ok.text;
              ring = insetRing(2, colors.ok.ring);
              icon = <CheckIcon size={16} color={colors.ok.icon} strokeWidth={2.6} />;
            } else if (isPicked) {
              bg = colors.err.chip;
              color = colors.err.text;
              icon = <CloseIcon size={14} color={colors.err.icon} strokeWidth={2.6} />;
            } else {
              bg = colors.surface2;
              color = colors.dim7;
            }
          } else if (isPicked) {
            ring = insetRing(2, colors.accent[600]);
          }
          return (
            <Tap
              key={o}
              haptic="selection"
              sound="none"
              disabled={!task}
              onPress={() => setAnswer(o)}
              className="h-[56px] flex-row items-center justify-between rounded-[14px] px-[16px]"
              style={{ width: '48%', flexGrow: 1, backgroundColor: bg, boxShadow: ring }}
            >
              <Text style={{ fontSize: 18, color }}>{o}</Text>
              {icon}
            </Tap>
          );
        })}
      </View>
    </>
  );
}
