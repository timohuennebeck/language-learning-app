import { InlineFlow } from '@/shared/components/inline-flow';
import { InlineMark } from '@/shared/components/inline-mark';
import { splitMarks } from '@/shared/lib/text';
import { colors } from '@/shared/theme/tokens';

const SIZE = 15;

/** The gap sentence's German translation, with the phrase the gap stands for highlighted. */
export function TranslationLine({ text, marks }: { text: string; marks: string[] }) {
  return (
    <InlineFlow
      style={{ marginTop: 12 }}
      textStyle={{ fontSize: SIZE, lineHeight: SIZE * 1.55, color: colors.muted }}
      pieces={splitMarks(text, marks).map((run, i) =>
        run.marked
          ? {
              key: `m${i}`,
              node: (
                <InlineMark
                  size={SIZE}
                  lineHeight={SIZE * 1.3}
                  color={colors.accent[900]}
                  bg={colors.track}
                  radius={5}
                  px={4}
                  py={1}
                >
                  {run.text}
                </InlineMark>
              ),
            }
          : run.text,
      )}
    />
  );
}
