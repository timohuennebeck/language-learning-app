import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Run } from '@/features/exercises/data/schemas';
import { colors } from '@/shared/theme/tokens';
import { Illustration } from '@/shared/ui/illustration';
import { CheckIcon, CloseIcon } from '@/shared/ui/icons';
import { Kicker } from '@/shared/ui/kicker';
import { Text } from '@/shared/ui/text';

/** Sentence with inline highlights and superscript footnote numbers. */
function RunsText({ runs, color, size = 17 }: { runs: Run[]; color: string; size?: number }) {
  return (
    <Text style={{ fontSize: size, lineHeight: size * 1.45, color }}>
      {runs.map((r, i) => (
        <Text key={i} style={{ fontSize: size, lineHeight: size * 1.45, color }}>
          <Text
            style={
              r.mark
                ? {
                    fontSize: size,
                    borderRadius: 6,
                    paddingHorizontal: 4,
                    backgroundColor: r.mark === 'ok' ? colors.ok.chip : colors.err.mark,
                    color: r.mark === 'ok' ? colors.ok.text : colors.err.text,
                  }
                : { fontSize: size, color }
            }
          >
            {r.text}
          </Text>
          {r.sup ? (
            <Text
              className="font-semibold"
              style={{
                fontSize: 12,
                color: colors.err.text,
                paddingLeft: 1,
                lineHeight: size * 1.45,
              }}
            >
              {' ' + r.sup}
            </Text>
          ) : null}
        </Text>
      ))}
    </Text>
  );
}

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
    <View
      className="relative mt-[62px] rounded-[26px] px-[20px] pb-[20px] pt-[18px]"
      style={{ backgroundColor: c.bg }}
    >
      <Illustration
        name={correct ? 'pip-trophy' : 'pip-wrong'}
        size={128}
        style={{ position: 'absolute', top: -84, right: -6 }}
      />
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
            <View className="flex-row" style={{ columnGap: 10 }}>
              <Kicker
                tracking={0.08}
                style={{ color: colors.err.label }}
                className="w-[58px] pt-[4px]"
              >
                {t('exercise.you')}
              </Kicker>
              <View className="flex-1">
                <RunsText runs={youLine} color={colors.muted} />
              </View>
            </View>
            <View className="flex-row" style={{ columnGap: 10 }}>
              <Kicker
                tracking={0.08}
                style={{ color: colors.err.label }}
                className="w-[58px] pt-[4px]"
              >
                {t('exercise.right')}
              </Kicker>
              <View className="flex-1">
                <RunsText runs={rightLine} color={colors.ink} />
              </View>
            </View>
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
  );
}
