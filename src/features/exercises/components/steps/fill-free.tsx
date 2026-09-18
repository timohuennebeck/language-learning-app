import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AnswerChip } from '@/features/exercises/components/answer-chip';
import { AutoWidthInput } from '@/features/exercises/components/auto-width-input';
import { SENTENCE, STEP_TOP } from '@/features/exercises/components/steps/layout';
import type { StepProps } from '@/features/exercises/components/steps/types';
import { Hint } from '@/shared/components/hint';
import { InlineFlow } from '@/shared/components/inline-flow';
import { colors } from '@/shared/theme/tokens';
import { Caret } from '@/shared/ui/caret';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** 19b3 / 25c / 25d · Lücke frei getippt. */
export function FillFree({
  step,
  phase,
  answer,
  setAnswer,
  onSubmit,
}: StepProps<'fill-free'> & { onSubmit?: () => void }) {
  const { t } = useTranslation();
  const task = phase === 'task';
  return (
    <>
      <Kicker size={12} style={{ marginTop: STEP_TOP }}>
        {t('exercise.fillFree')}
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
                  height: 46,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 14,
                  backgroundColor: colors.white,
                  boxShadow: `0 0 0 2px ${colors.accent[500]}`,
                  paddingHorizontal: 12,
                }}
              >
                <AutoWidthInput
                  value={answer}
                  onChangeText={setAnswer}
                  fontSize={SENTENCE.fontSize - 2}
                  lineHeight={34}
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                />
                <Caret height={24} style={{ marginLeft: 2 }} />
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
      {task ? <Hint text={step.hint} className="mt-[22px]" /> : null}
    </>
  );
}
