import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AutoWidthInput } from '@/features/exercises/components/auto-width-input';
import type { StepProps } from '@/features/exercises/components/steps/types';
import { Hint } from '@/shared/components/hint';
import { colors } from '@/shared/theme/tokens';
import { Caret } from '@/shared/ui/caret';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** 19d1 / 25g / 25h · Übersetzen frei getippt. */
export function TranslateFree({
  step,
  phase,
  answer,
  setAnswer,
  onSubmit,
}: StepProps<'translate-free'> & { onSubmit?: () => void }) {
  const { t } = useTranslation();
  const task = phase === 'task';
  const ok = phase === 'correct';
  return (
    <>
      <Kicker size={12} style={{ marginTop: 26 }}>
        {t('exercise.translateFree')}
      </Kicker>
      <Text
        className="text-ink"
        style={{ fontSize: task ? 23 : 21, lineHeight: (task ? 23 : 21) * 1.4, marginTop: 12 }}
      >
        {step.prompt}
      </Text>
      {task ? (
        <View
          className="rounded-[22px] bg-white p-[18px]"
          style={{ marginTop: 20, minHeight: 130, boxShadow: `0 0 0 2px ${colors.accent[500]}` }}
        >
          <Text className="text-faint" style={{ fontSize: 12 }}>
            {t('exercise.inFrench')}
          </Text>
          <View className="mt-[10px] flex-row flex-wrap items-center">
            <AutoWidthInput
              value={answer}
              onChangeText={setAnswer}
              fontSize={21}
              lineHeight={30.45}
              color={colors.ink}
              autoCapitalize="sentences"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
            <Caret height={21} style={{ marginLeft: 2 }} />
          </View>
        </View>
      ) : (
        <View
          className="rounded-[22px] bg-white p-[16px]"
          style={{ marginTop: 14, boxShadow: `0 0 0 2px ${ok ? colors.ok.ring : colors.err.ring}` }}
        >
          <Text style={{ fontSize: 12, color: ok ? colors.ok.label : colors.err.label2 }}>
            {t('exercise.yourAnswer')}
          </Text>
          <Text className="mt-[8px] text-ink" style={{ fontSize: 19, lineHeight: 27.55 }}>
            {ok
              ? answer
              : answer.split(step.wrongTypedMark).map((part, i, arr) => (
                  <Text key={i} className="text-ink" style={{ fontSize: 19 }}>
                    {part}
                    {i < arr.length - 1 ? (
                      <Text
                        style={{
                          fontSize: 19,
                          backgroundColor: colors.err.chip,
                          borderRadius: 6,
                          paddingHorizontal: 3,
                          color: colors.ink,
                        }}
                      >
                        {step.wrongTypedMark}
                      </Text>
                    ) : null}
                  </Text>
                ))}
          </Text>
        </View>
      )}
      {task ? <Hint text={step.hint} className="mt-[12px]" /> : null}
    </>
  );
}
