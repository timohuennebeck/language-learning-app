import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AnswerChip } from '@/features/exercises/components/answer-chip';
import { AutoWidthInput } from '@/features/exercises/components/auto-width-input';
import type { StepProps } from '@/features/exercises/components/steps/types';
import { Hint } from '@/shared/components/hint';
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
  const size = task ? 29 : 26;
  return (
    <>
      <Kicker size={12} style={{ marginTop: task ? 28 : 26 }}>
        {t('exercise.fillFree')}
      </Kicker>
      <Text
        className="text-ink"
        style={{
          fontSize: size,
          lineHeight: task ? 49.3 : 41.6,
          letterSpacing: -0.01 * size,
          marginTop: task ? 16 : 14,
        }}
      >
        {step.pre}
        {task ? (
          <View
            style={{
              minWidth: 130,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 14,
              backgroundColor: '#fff',
              boxShadow: `0 0 0 2px ${colors.accent[500]}`,
              paddingHorizontal: 12,
              paddingVertical: 2,
              transform: [{ translateY: 8 }],
            }}
          >
            <AutoWidthInput
              value={answer}
              onChangeText={setAnswer}
              fontSize={29}
              lineHeight={36}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
            <Caret height={26} style={{ marginLeft: 2 }} />
          </View>
        ) : (
          <AnswerChip text={answer} ok={phase === 'correct'} size={size} />
        )}
        {step.post}
      </Text>
      <Text className="text-muted" style={{ fontSize: 15, marginTop: task ? 14 : 10 }}>
        {step.translation}
      </Text>
      {task ? <Hint text={step.hint} className="mt-[22px]" /> : null}
    </>
  );
}
