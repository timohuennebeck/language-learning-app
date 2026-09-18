import type { Run } from '@/features/exercises/data/schemas';
import { InlineFlow, type FlowPiece } from '@/shared/components/inline-flow';
import { InlineMark } from '@/shared/components/inline-mark';
import { colors } from '@/shared/theme/tokens';
import { Text } from '@/shared/ui/text';

type Props = {
  runs: Run[];
  /** Colour of the plain words. */
  color: string;
  size?: number;
  /** Text colour inside the marks; defaults to the green/red mark colours. */
  markColor?: string;
};

/**
 * Sentence with rounded inline highlights and superscript footnote numbers (feedback lines,
 * the typed answer with its wrong phrase marked). Marks are Views so the corners round natively.
 */
export function MarkedRuns({ runs, color, size = 17, markColor }: Props) {
  const lineHeight = size * 1.45;
  const pieces: FlowPiece[] = [];
  runs.forEach((r, i) => {
    if (r.mark) {
      const ok = r.mark === 'ok';
      pieces.push({
        key: `m${i}`,
        node: (
          <InlineMark
            size={size}
            color={markColor ?? (ok ? colors.ok.text : colors.err.text)}
            bg={ok ? colors.ok.chip : colors.err.mark}
          >
            {r.text}
          </InlineMark>
        ),
      });
    } else {
      pieces.push(r.text);
    }
    if (r.sup) {
      pieces.push({
        key: `s${i}`,
        node: (
          <Text
            className="font-semibold"
            style={{
              fontSize: 12,
              lineHeight: 12,
              paddingLeft: 3,
              // Raise the footnote number above the baseline.
              marginBottom: size * 0.55,
              color: colors.err.text,
            }}
          >
            {r.sup}
          </Text>
        ),
      });
    }
  });
  return <InlineFlow pieces={pieces} textStyle={{ fontSize: size, lineHeight, color }} />;
}
