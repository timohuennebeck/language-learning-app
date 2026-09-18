import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MarkedRuns } from '@/features/exercises/components/marked-runs';
import { PROMPT, STEP_TOP } from '@/features/exercises/components/steps/layout';
import type { StepProps } from '@/features/exercises/components/steps/types';
import type { Run } from '@/features/exercises/data/schemas';
import { Hint } from '@/shared/components/hint';
import { NO_OUTLINE } from '@/shared/lib/styles';
import { colors } from '@/shared/theme/tokens';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** Splits the typed answer into runs, marking every occurrence of `mark`. */
function markTyped(typed: string, mark: string): Run[] {
  return typed
    .split(mark)
    .flatMap((part, i): Run[] =>
      i === 0 ? [{ text: part }] : [{ text: mark, mark: 'err' }, { text: part }],
    )
    .filter((r) => r.text);
}

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
  const ring = task ? colors.accent[500] : ok ? colors.ok.ring : colors.err.ring;
  return (
    <>
      <Kicker size={12} style={{ marginTop: STEP_TOP }}>
        {t('exercise.translateFree')}
      </Kicker>
      <Text style={{ ...PROMPT, marginTop: 12 }}>{step.prompt}</Text>
      <View
        className="rounded-[22px] bg-white px-[18px] py-[16px]"
        style={{ marginTop: 18, minHeight: task ? 130 : undefined, boxShadow: `0 0 0 2px ${ring}` }}
      >
        <Text
          style={{
            fontSize: 12,
            color: task ? colors.faint : ok ? colors.ok.label : colors.err.label2,
          }}
        >
          {task ? t('exercise.inFrench') : t('exercise.yourAnswer')}
        </Text>
        {task ? (
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            multiline
            autoFocus
            autoCorrect={false}
            autoCapitalize="sentences"
            returnKeyType="done"
            submitBehavior="submit"
            onSubmitEditing={onSubmit}
            cursorColor={colors.accent[700]}
            selectionColor={colors.accent[300]}
            className="font-regular"
            style={[
              {
                marginTop: 8,
                padding: 0,
                fontSize: 20,
                lineHeight: 29,
                color: colors.ink,
                textAlignVertical: 'top',
              },
              NO_OUTLINE,
            ]}
          />
        ) : (
          <View className="mt-[8px]">
            <MarkedRuns
              runs={ok ? [{ text: answer }] : markTyped(answer, step.wrongTypedMark)}
              color={colors.ink}
              markColor={colors.ink}
              size={19}
            />
          </View>
        )}
      </View>
      {task ? <Hint text={step.hint} className="mt-[12px]" /> : null}
    </>
  );
}
