import { View } from 'react-native';

import type { Run } from '@/features/exercises/data/types';
import { InlineFlow, type FlowPiece } from '@/shared/components/inline-flow';
import { InlineMark } from '@/shared/components/inline-mark';
import { colors } from '@/shared/theme/tokens';
import { Text } from '@/shared/ui/text';

interface Props {
  runs: Run[];
  /** Colour of the plain words. */
  color: string;
  size?: number;
  /** Text colour inside the marks; defaults to the green/red mark colours. */
  markColor?: string;
}

/**
 * Sentence with rounded inline highlights and superscript footnote numbers (feedback lines,
 * the typed answer with its wrong phrase marked). Marks are Views so the corners round natively.
 */
export function MarkedRuns({ runs, color, size = 17, markColor }: Props) {
  const lineHeight = size * 1.45;
  const pieces: FlowPiece[] = runs.map((r, i) => {
    if (!r.mark) return r.text;
    const ok = r.mark === 'ok';
    const mark = (
      <InlineMark
        size={size}
        color={markColor ?? (ok ? colors.ok.text : colors.err.text)}
        bg={ok ? colors.ok.chip : colors.err.mark}
      >
        {r.text}
      </InlineMark>
    );
    // The footnote number shares one wrap item with its mark so it can never wrap alone.
    return {
      key: `m${i}`,
      node: r.sup ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {mark}
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
        </View>
      ) : (
        mark
      ),
    };
  });
  return <InlineFlow pieces={pieces} textStyle={{ fontSize: size, lineHeight, color }} />;
}
