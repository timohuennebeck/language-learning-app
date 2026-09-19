import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AutoWidthInput } from '@/features/exercises/components/auto-width-input';
import { STEP_TOP } from '@/features/exercises/components/steps/layout';
import type { StepProps } from '@/features/exercises/components/steps/types';
import { isSameAnswer } from '@/features/exercises/lib/answers';
import { InlineMark } from '@/shared/components/inline-mark';
import { colors } from '@/shared/theme/tokens';
import { Caret } from '@/shared/ui/caret';
import { Kicker } from '@/shared/ui/kicker';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

const FORM = 17;

/** A verb form in the result table: green when right, red and struck through when wrong. */
function FormChip({ text, ok }: { text: string; ok: boolean }) {
  return (
    <InlineMark
      size={FORM}
      lineHeight={FORM * 1.35}
      color={ok ? colors.ok.text : colors.err.text}
      bg={ok ? colors.ok.chip : colors.err.chip}
      radius={8}
      px={10}
      py={3}
      textClassName={ok ? undefined : 'line-through'}
    >
      {text}
    </InlineMark>
  );
}

/** 68a / 68b / 68c · Tabelle füllen: one input per pronoun, forms checked row by row. */
export function Conjugate({
  step,
  phase,
  answer,
  setAnswer,
  onSubmit,
}: StepProps<'conjugate', string[]> & { onSubmit?: () => void }) {
  const { t } = useTranslation();
  const task = phase === 'task';
  const [focus, setFocus] = useState(0);
  const last = step.pronouns.length - 1;
  let wrongCount = 0;
  return (
    <>
      <Kicker size={12} style={{ marginTop: STEP_TOP }}>
        {t('exercise.conjugate')}
      </Kicker>
      <View className="mt-[12px] flex-row items-baseline" style={{ columnGap: 10 }}>
        <Text
          className="font-semibold text-ink"
          style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.56 }}
        >
          {step.verb}
        </Text>
        <Text className="text-muted" style={{ fontSize: 15 }}>
          {step.meaning}
        </Text>
      </View>
      <View className="mt-[12px] self-start rounded-pill bg-accent-800 px-[14px] py-[7px]">
        <Text className="font-semibold text-accent-100" style={{ fontSize: 13 }}>
          {step.tense}
        </Text>
      </View>
      <View className="mt-[16px] rounded-[22px] bg-white px-[16px]">
        {step.pronouns.map((pronoun, i) => {
          const value = answer[i] ?? '';
          const ok = isSameAnswer(value, step.answer[i]);
          const sup = !task && !ok ? ++wrongCount : 0;
          return (
            <Tap
              key={pronoun}
              haptic="none"
              accessibilityRole="none"
              disabled={!task}
              onPress={() => setFocus(i)}
              className="flex-row items-center"
              style={{
                minHeight: 42,
                columnGap: 8,
                borderTopWidth: i === 0 ? 0 : 1,
                borderColor: colors.surface2,
              }}
            >
              <Text className="w-[64px] text-muted" style={{ fontSize: 14 }}>
                {pronoun}
              </Text>
              {task ? (
                focus === i ? (
                  <View className="flex-1 flex-row items-center">
                    <AutoWidthInput
                      value={value}
                      onChangeText={(v) => setAnswer(answer.map((a, j) => (j === i ? v : a)))}
                      fontSize={FORM}
                      lineHeight={24}
                      color={colors.ink}
                      returnKeyType={i < last ? 'next' : 'done'}
                      onSubmitEditing={() => (i < last ? setFocus(i + 1) : onSubmit?.())}
                    />
                    <Caret height={18} style={{ marginLeft: 2 }} />
                  </View>
                ) : value ? (
                  <Text className="text-ink" style={{ fontSize: FORM, lineHeight: 24 }}>
                    {value}
                  </Text>
                ) : (
                  <View className="h-[14px] flex-1 rounded-pill bg-surface2" />
                )
              ) : (
                <View className="flex-1 flex-row flex-wrap items-center" style={{ gap: 8 }}>
                  {ok ? (
                    <FormChip text={step.answer[i]} ok />
                  ) : (
                    <>
                      <FormChip text={value} ok={false} />
                      <FormChip text={step.answer[i]} ok />
                      <Text
                        className="font-semibold"
                        style={{ fontSize: 12, lineHeight: 12, color: colors.err.text }}
                      >
                        {sup}
                      </Text>
                    </>
                  )}
                </View>
              )}
            </Tap>
          );
        })}
      </View>
    </>
  );
}
