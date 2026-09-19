// Turning three model outputs into the stored document, and refusing the ones that are wrong.
//
// Structured outputs guarantee shape, not truth. A wrong gloss is worse than no text at all: the
// learner memorises the error and the flashcard they save from it keeps teaching it. So everything
// the annotator claims is checked against the prose the writer actually wrote, and anything that
// does not check out is dropped rather than shown.

export interface WriterSentence {
  source: string;
  native: string;
}
export interface WriterSection {
  sentences: WriterSentence[];
}
export interface WriterText {
  title: string;
  sections: WriterSection[];
}

export interface AnnotatorSpan {
  sentence: string;
  surface: string;
  here: string;
  nativeMarks: string[];
  mark: boolean;
  /** An offered dictionary entry the model judged to fit this sentence, or null. */
  lexeme: string | null;
  /** A fresh dictionary entry, when nothing offered fitted. Resolved before the document is built. */
  gloss?: {
    trans: string;
    note: string | null;
    example: string | null;
    tag: string | null;
    gender: 'm' | 'f' | null;
    level: string | null;
  } | null;
}

/** A span as it is stored: `at`/`len` index `source` in UTF-16 code units, the unit JS slices in. */
export interface Span {
  at: number;
  len: number;
  lexeme: string;
  here: string;
  nativeMarks: string[];
  mark?: true;
}

export interface Sentence {
  id: string;
  source: string;
  native: string;
  spans: Span[];
}

export interface Document {
  title: string;
  sections: { sentences: Sentence[] }[];
}

/**
 * Where `surface` sits in `source`, or -1.
 *
 * Exact first. A model asked to quote a sentence-initial phrase will hand back "je me suis assise"
 * for a sentence that reads "Je me suis assise", and refusing that would throw away a correct
 * annotation over a capital letter — so a case-insensitive match is accepted and the offset still
 * points at what the sentence really says. `from` lets a repeated word find its second occurrence.
 */
export function findSurface(source: string, surface: string, from = 0): number {
  if (!surface) return -1;
  const exact = source.indexOf(surface, from);
  if (exact >= 0) return exact;
  return source.toLocaleLowerCase().indexOf(surface.toLocaleLowerCase(), from);
}

export interface BuildResult {
  document: Document;
  lexemeIds: string[];
  wordCount: number;
  /** Everything dropped, and why. Written to the row so a thin text can be explained later. */
  dropped: string[];
}

/**
 * Assembles the document. `resolved` maps a span (by sentence id and surface) to the lexeme it
 * belongs to; a span with no lexeme is dropped, because a word the learner cannot tap through to
 * a meaning is worse than plain prose.
 */
export function buildDocument(
  text: WriterText,
  spansBySentence: Map<string, AnnotatorSpan[]>,
  lexemeOf: (sentenceId: string, surface: string) => string | null,
): BuildResult {
  const dropped: string[] = [];
  const lexemeIds = new Set<string>();
  let wordCount = 0;
  let sentenceNumber = 0;

  const sections = text.sections.map((section) => ({
    sentences: section.sentences.map((sentence) => {
      sentenceNumber += 1;
      const id = `s${sentenceNumber}`;
      const source = sentence.source.normalize('NFC');
      const native = sentence.native.normalize('NFC');
      wordCount += source.split(/\s+/).filter(Boolean).length;

      const spans: Span[] = [];
      const used: { at: number; end: number }[] = [];

      for (const span of spansBySentence.get(id) ?? []) {
        const surface = span.surface.normalize('NFC');

        // Find an occurrence that does not collide with a span already placed: the same word can
        // appear twice in one sentence and each occurrence is its own span.
        let at = -1;
        for (let from = 0; ;) {
          const found = findSurface(source, surface, from);
          if (found < 0) break;
          if (!used.some((u) => found < u.end && found + surface.length > u.at)) {
            at = found;
            break;
          }
          from = found + 1;
        }
        if (at < 0) {
          dropped.push(`${id}: "${span.surface}" is not in the sentence`);
          continue;
        }

        const lexeme = lexemeOf(id, span.surface);
        if (!lexeme) {
          dropped.push(`${id}: "${span.surface}" has no lexeme`);
          continue;
        }

        // A mark the translation does not contain would highlight nothing, or the wrong words.
        const marks = span.nativeMarks
          .map((m) => m.normalize('NFC'))
          .filter((m) => m && native.includes(m));

        lexemeIds.add(lexeme);
        used.push({ at, end: at + surface.length });
        spans.push({
          at,
          len: surface.length,
          lexeme,
          here: span.here,
          nativeMarks: marks,
          ...(span.mark ? { mark: true as const } : {}),
        });
      }

      spans.sort((a, b) => a.at - b.at);
      return { id, source, native, spans };
    }),
  }));

  return {
    document: { title: text.title.trim(), sections },
    lexemeIds: [...lexemeIds],
    wordCount,
    dropped,
  };
}

export class InvalidText extends Error {}

/**
 * The checks that make a text unfit to show, as opposed to merely thinner than hoped. Each one is
 * phrased as the complaint that goes back to the model on the retry.
 */
export function assertUsable(
  result: BuildResult,
  expected: { sections: number; words: number; dueLemmas: number; dueHit: number },
): void {
  const { document, wordCount } = result;
  const sections = document.sections.length;
  if (sections < 2 || sections > expected.sections) {
    throw new InvalidText(`you wrote ${sections} sections, not ${expected.sections}`);
  }
  if (!document.title) throw new InvalidText('the title is empty');

  for (const section of document.sections) {
    if (!section.sentences.length) throw new InvalidText('a section has no sentences');
    for (const s of section.sentences) {
      if (!s.source.trim()) throw new InvalidText('a sentence is empty');
      if (!s.native.trim()) throw new InvalidText(`the sentence "${s.source}" has no translation`);
    }
  }

  const low = Math.round(expected.words * 0.7);
  const high = Math.round(expected.words * 1.3);
  if (wordCount < low || wordCount > high) {
    throw new InvalidText(
      `you wrote ${wordCount} words; aim for ${expected.words} (${low}–${high})`,
    );
  }

  // A text with almost nothing tappable is not the feature, whatever the prose is like.
  const spans = document.sections.reduce(
    (n, section) => n + section.sentences.reduce((m, s) => m + s.spans.length, 0),
    0,
  );
  if (spans < wordCount / 8) {
    throw new InvalidText(`only ${spans} words could be explained out of ${wordCount}`);
  }

  // The point of the text is to bring the learner's due words back in prose.
  const want = Math.min(6, expected.dueLemmas);
  if (want && expected.dueHit < want) {
    throw new InvalidText(
      `only ${expected.dueHit} of the learner's due words appear; use at least ${want} of them`,
    );
  }
}
