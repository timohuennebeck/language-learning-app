import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MarkedRuns } from '@/features/exercises/components/marked-runs';
import type { Run } from '@/features/exercises/data/schemas';
import { colors } from '@/shared/theme/tokens';
import { Illustration } from '@/shared/ui/illustration';
import { CheckIcon, CloseIcon } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** Height of the Pip artwork peeking over the card's top-right corner. */
const PIP = 128;
/** How far Pip stands above the card (the rest overlaps the card). */
const PIP_ABOVE = 84;
/** Space between the content above and the card; Pip's head reaches into it. */
const CARD_TOP = 62;

type Props = {
  correct: boolean;
  why: string;
  wrongWhy: string[];
  youLine: Run[];
  rightLine: Run[];
};

/** The green/red feedback card with Pip peeking over the top-right corner. */
export function FeedbackCard({ correct, why, wrongWhy, youLine, rightLine }: Props) {
  const { t } = useTranslation();
  const c = correct ? colors.ok : colors.err;
  return (
    // Pip lives in a wrapper that includes the space above the card, so no platform clips him.
    <View
      style={{
        paddingTop: PIP_ABOVE,
        marginTop: CARD_TOP - PIP_ABOVE,
        marginHorizontal: -6,
        paddingHorizontal: 6,
      }}
    >
      <View
        className="rounded-[26px] px-[20px] pb-[20px] pt-[18px]"
        style={{ backgroundColor: c.bg }}
      >
        <View className="flex-row items-center pr-[118px]" style={{ columnGap: 9 }}>
          <View
            className="h-[22px] w-[22px] items-center justify-center rounded-full"
            style={{ backgroundColor: c.icon }}
          >
            {correct ? (
              <CheckIcon size={13} color={colors.ok.check} strokeWidth={3.2} />
            ) : (
              <CloseIcon size={11} color={colors.err.check} strokeWidth={3.2} />
            )}
          </View>
          <Text
            className="font-semibold"
            style={{
              fontSize: 17,
              lineHeight: 22,
              color: correct ? colors.ok.title : colors.err.text,
            }}
          >
            {correct ? t('exercise.correct') : t('exercise.wrong')}
          </Text>
        </View>
        {correct ? (
          <Text
            className="mt-[8px]"
            style={{ fontSize: 15, lineHeight: 21.75, color: colors.ok.body, maxWidth: 250 }}
          >
            {why}
          </Text>
        ) : (
          <>
            <View className="mt-[12px]" style={{ rowGap: 10 }}>
              {[
                { label: t('exercise.you'), runs: youLine, color: colors.muted },
                { label: t('exercise.right'), runs: rightLine, color: colors.ink },
              ].map((line) => (
                <View key={line.label} className="flex-row" style={{ columnGap: 10 }}>
                  <Kicker
                    tracking={0.08}
                    style={{ color: colors.err.label }}
                    className="w-[58px] pt-[4px]"
                  >
                    {line.label}
                  </Kicker>
                  <View className="flex-1">
                    <MarkedRuns runs={line.runs} color={line.color} />
                  </View>
                </View>
              ))}
            </View>
            <View className="mt-[10px]" style={{ rowGap: 7 }}>
              {wrongWhy.map((w, i) => (
                <View key={i} className="flex-row" style={{ columnGap: 8 }}>
                  <Text
                    className="w-[14px] font-semibold"
                    style={{ fontSize: 14.5, lineHeight: 20.3, color: colors.err.text }}
                  >
                    {i + 1}
                  </Text>
                  <Text
                    className="flex-1"
                    style={{ fontSize: 14.5, lineHeight: 20.3, color: colors.err.body }}
                  >
                    {w}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
      <Illustration
        name={correct ? 'pip-trophy' : 'pip-wrong'}
        size={PIP}
        style={{ position: 'absolute', top: 0, right: 0 }}
      />
    </View>
  );
}
