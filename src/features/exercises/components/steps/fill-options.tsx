import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AnswerChip } from '@/features/exercises/components/answer-chip';
import type { StepProps } from '@/features/exercises/components/steps/types';
import { colors } from '@/shared/theme/tokens';
import { CheckIcon, CloseIcon, DragHandle } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { Tap } from '@/shared/ui/tap';
import { Text } from '@/shared/ui/text';

/** 19a2 / 25a / 25b · Lücke mit Optionen. */
export function FillOptions({ step, phase, answer, setAnswer }: StepProps<'fill-options'>) {
  const { t } = useTranslation();
  const task = phase === 'task';
  const size = task ? 31 : 26;
  return (
    <>
      <Kicker size={12} style={{ marginTop: task ? 34 : 26 }}>
        {t('exercise.fill')}
      </Kicker>
      <Text
        className="text-ink"
        style={{
          fontSize: size,
          lineHeight: size * 1.4,
          letterSpacing: -0.02 * size,
          marginTop: task ? 14 : 12,
        }}
      >
        {step.pre}
        {task ? (
          <View
            style={{
              minWidth: 130,
              height: 44,
              borderRadius: 14,
              backgroundColor: answer ? colors.surface : '#e9ebf9',
              boxShadow: `inset 0 0 0 1.5px ${colors.accent[500]}`,
              transform: [{ translateY: 10 }],
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
            }}
          >
            {answer ? (
              <Text className="text-accent-900" style={{ fontSize: 26 }}>
                {answer}
              </Text>
            ) : null}
          </View>
        ) : (
          <AnswerChip text={answer} ok={phase === 'correct'} size={size} />
        )}
        {step.post}
      </Text>
      {task ? (
        <Text className="text-muted" style={{ fontSize: 15, marginTop: 14 }}>
          {step.translation}
        </Text>
      ) : null}
      <View className="flex-row flex-wrap" style={{ gap: 10, marginTop: task ? 30 : 22 }}>
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
              ring = `inset 0 0 0 2px ${colors.ok.ring}`;
              icon = <CheckIcon size={16} color={colors.ok.icon} strokeWidth={2.6} />;
            } else if (isPicked) {
              bg = colors.err.chip;
              color = colors.err.text;
              icon = <CloseIcon size={14} color="#a8544c" strokeWidth={2.6} />;
            } else {
              bg = colors.surface2;
              color = colors.dim7;
            }
          } else if (isPicked) {
            ring = `inset 0 0 0 2px ${colors.accent[600]}`;
          }
          return (
            <Tap
              key={o}
              haptic="selection"
              disabled={!task}
              onPress={() => setAnswer(o)}
              className="h-[56px] flex-row items-center rounded-[14px] px-[16px]"
              style={{
                width: '48%',
                flexGrow: 1,
                backgroundColor: bg,
                boxShadow: ring,
                columnGap: 10,
                justifyContent: task ? 'flex-start' : 'space-between',
              }}
            >
              {task ? <DragHandle /> : null}
              <Text style={{ fontSize: 18, color }}>{o}</Text>
              {icon}
            </Tap>
          );
        })}
      </View>
    </>
  );
}
