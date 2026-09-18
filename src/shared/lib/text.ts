export type MarkedRun = { text: string; marked: boolean };

/**
 * Splits `text` into plain and marked runs for every occurrence of the given phrases
 * (earliest match first). Used to highlight a translation inside a sentence and a wrong
 * phrase inside a typed answer.
 */
export function splitMarks(text: string, marks: string[]): MarkedRun[] {
  const phrases = marks.filter(Boolean);
  const out: MarkedRun[] = [];
  let rest = text;
  while (rest) {
    let best: { at: number; mark: string } | null = null;
    for (const mark of phrases) {
      const at = rest.indexOf(mark);
      if (at >= 0 && (!best || at < best.at)) best = { at, mark };
    }
    if (!best) break;
    if (best.at > 0) out.push({ text: rest.slice(0, best.at), marked: false });
    out.push({ text: best.mark, marked: true });
    rest = rest.slice(best.at + best.mark.length);
  }
  if (rest) out.push({ text: rest, marked: false });
  return out;
}
