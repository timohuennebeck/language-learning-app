/**
 * A generated reading text. The stored document carries no vocabulary: its spans point at
 * `lexemes` by id, which is what lets a text read again next week show today's meanings and tint
 * every word by how well the learner knows it *now* (docs/lesetext-plan.md §2).
 */

/** A tappable word. `at`/`len` index the sentence's `source` in UTF-16 code units. */
export interface Span {
  at: number;
  len: number;
  /** `lexemes.id` — the dictionary entry this word belongs to. */
  lexeme: string;
  /** What this exact form means here ("ich bin gegangen"), as opposed to the entry ("gehen"). */
  here: string;
  /** The parts of `native` that render this word; highlighted on the word screen. */
  nativeMarks: string[];
  /** One of the section's chosen highlights, so it gets a tint. Every span is tappable. */
  mark?: true;
}

export interface Sentence {
  id: string;
  source: string;
  native: string;
  spans: Span[];
}

export interface ReadingSection {
  sentences: Sentence[];
}

export interface ReadingDocument {
  title: string;
  sections: ReadingSection[];
}

export type GenerationStatus = 'generating' | 'ready' | 'failed';

/** The row the preparing screen polls and the reading screen renders. */
export interface ReadingText {
  id: string;
  status: GenerationStatus;
  /** 0 queued · 1 writing · 2 explaining · 3 done — drives the checklist while it generates. */
  stage: number;
  errorCode: string | null;
  language: string;
  nativeLanguage: string;
  title: string | null;
  topic: string | null;
  content: ReadingDocument | null;
  lexemeIds: string[];
  sectionCount: number;
  wordCount: number;
  minutes: number;
  currentSection: number;
  completedAt: string | null;
  createdAt: string;
}

/** A dictionary entry as the word screen shows it. */
export interface Lexeme {
  id: string;
  lemma: string;
  pos: string;
  gender: string | null;
  example: string | null;
  tag: string | null;
  /** The meaning in the learner's app language. */
  trans: string;
  note: string | null;
}

/** What the learner's deck knows about one word; absent when they have no card for it. */
export interface WordState {
  box: number;
  reviews: number;
  lapses: number;
}

/** Everything one text needs to render: the row, its vocabulary and the learner's boxes. */
export interface ReadingBundle {
  text: ReadingText;
  lexemes: Record<string, Lexeme>;
  states: Record<string, WordState>;
}
