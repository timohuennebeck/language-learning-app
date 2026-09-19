// Prompts and schemas for `generate-reading` (docs/lesetext-plan.md §4).
//
// Three calls with different jobs. The writer produces prose and its translation — judgement, and
// the only pass worth an expensive model. The lemmatiser names each content word's dictionary
// form. The annotator explains the words the dictionary does not already cover. The last two are
// mechanical and checked deterministically by the validator, so they run on the cheap model.
//
// Bump PROMPT_VERSION whenever any wording below changes; it is stored per row so a bad text can
// be traced to the prompt that produced it.

import { languageName } from './prompt.ts';
import { POS } from './lexemes.ts';

export const READING_PROMPT_VERSION = '2026-09-19.1';

/** Words per text, by level. A two-minute read at learner pace is a little over 200 words. */
const WORD_TARGET: Record<string, number> = { A1: 110, A2: 160, B1: 220, B2: 280 };
export const wordTarget = (level: string) => WORD_TARGET[level] ?? 200;

/** Reading minutes shown on the card, at ~110 words a minute in a foreign language. */
export const readingMinutes = (words: number) => Math.max(1, Math.round(words / 110));

export const SECTION_COUNT = 3;

const LEVEL_GUIDE: Record<string, string> = {
  A1: 'present tense, very common words, short main clauses',
  A2: 'passé composé and imparfait, everyday vocabulary, some subordinate clauses',
  B1: 'connected narration, opinions, relative clauses, some idiom',
  B2: 'nuance and register, subjunctive where natural, richer vocabulary',
};

export interface WriterInput {
  language: string;
  nativeLanguage: string;
  level: string;
  topic: string | null;
  goal: string | null;
  /** Lemmas of the learner's due flashcards; the text is built to bring them back in prose. */
  dueWords: string[];
  /** Words from the last conversation's review, so the text follows what they just talked about. */
  recentWords: string[];
  lastConversationTopic: string | null;
  /** Titles of the last few texts, so it stops writing about cafés. */
  recentTitles: string[];
  /** Appended after a failed attempt, naming what the validator rejected. */
  complaint?: string | null;
}

export function writerInstructions(p: WriterInput): string {
  const learning = languageName(p.language);
  const native = languageName(p.nativeLanguage);
  const words = wordTarget(p.level);
  return [
    `You write short reading texts for someone learning ${learning}, at CEFR level ${p.level}.`,
    `Write a first-person story of about ${words} words in ${learning}, in ${SECTION_COUNT} sections of roughly equal length. Each section is 3 to 5 sentences.`,
    `Level ${p.level} means: ${LEVEL_GUIDE[p.level] ?? LEVEL_GUIDE.B1}. Stay at this level. At most 8 words may sit above it.`,
    `For every sentence also give "native": a natural ${native} translation of that sentence alone. It must be idiomatic ${native}, not word-for-word, but it must not add or drop information.`,
    `"title": 2 to 4 words in ${learning}.`,
    'The story must be concrete: one scene, one day, things that happen. No morals, no summaries, no second person.',
  ].join('\n');
}

export function writerInput(p: WriterInput): string {
  const lines: string[] = [];
  if (p.topic) lines.push(`Topic the learner chose: ${p.topic}`);
  else if (p.lastConversationTopic)
    lines.push(`They last talked about: ${p.lastConversationTopic}`);
  if (p.goal) lines.push(`They are learning for: ${p.goal}`);
  if (p.dueWords.length) {
    lines.push(
      `Words they are studying right now — work at least ${Math.min(8, p.dueWords.length)} of these into the story naturally, inflected as the sentence needs: ${p.dueWords.join(', ')}`,
    );
  }
  if (p.recentWords.length) {
    lines.push(`Words from their last conversation, good to reuse: ${p.recentWords.join(', ')}`);
  }
  if (p.recentTitles.length) {
    lines.push(`Do not repeat these recent texts: ${p.recentTitles.join('; ')}`);
  }
  if (p.complaint) lines.push(`Your previous attempt was rejected: ${p.complaint}. Fix that.`);
  return lines.join('\n') || 'No history yet: write something everyday and concrete.';
}

export const WRITER_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sentences: {
            type: 'array',
            items: {
              type: 'object',
              properties: { source: { type: 'string' }, native: { type: 'string' } },
              required: ['source', 'native'],
              additionalProperties: false,
            },
          },
        },
        required: ['sentences'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'sections'],
  additionalProperties: false,
} as const;

export function lemmatiserInstructions(language: string): string {
  const learning = languageName(language);
  return [
    `You mark up ${learning} sentences for a language learner.`,
    'For each sentence, list its content words and fixed phrases: nouns, verbs, adjectives, adverbs, and multi-word expressions that mean something as a unit.',
    'Skip pure function words: articles, bare prepositions, conjunctions, pronouns standing alone.',
    '"surface" must be copied from the sentence character for character, including any apostrophes and accents, and the surfaces within one sentence must not overlap.',
    'Prefer the longest useful unit: for a compound verb form give the whole form ("je suis allée"), for a fixed phrase the whole phrase ("tout de suite").',
    '"lemma" is the dictionary form of that word: infinitive for verbs, singular for nouns (without an article), masculine singular for adjectives.',
    `"pos" is one of: ${POS.join(', ')}. Use "phrase" for multi-word expressions.`,
  ].join('\n');
}

export const LEMMATISER_SCHEMA = {
  type: 'object',
  properties: {
    sentences: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          words: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                surface: { type: 'string' },
                lemma: { type: 'string' },
                pos: { type: 'string', enum: POS },
              },
              required: ['surface', 'lemma', 'pos'],
              additionalProperties: false,
            },
          },
        },
        required: ['id', 'words'],
        additionalProperties: false,
      },
    },
  },
  required: ['sentences'],
  additionalProperties: false,
} as const;

export function annotatorInstructions(language: string, nativeLanguage: string): string {
  const learning = languageName(language);
  const native = languageName(nativeLanguage);
  return [
    `You explain ${learning} words to a ${native}-speaking learner, one word at a time, in context.`,
    `For each word you are given the sentence it appears in and that sentence's ${native} translation.`,
    `"here": what this exact form means in this sentence, in ${native}. For "je suis allée" that is "ich bin gegangen", not "gehen".`,
    `"nativeMarks": the parts of the ${native} translation that render this word. Copy them from the translation character for character. Use several when the ${native} splits ("bin ich", "gegangen"); use an empty list if nothing in the translation corresponds.`,
    'If one of the offered dictionary entries is the right meaning for this sentence, put its id in "lexeme" and leave "gloss" null.',
    'If none of them fits this sentence, or none was offered, leave "lexeme" null and fill in "gloss" instead:',
    `  "trans": the dictionary meaning in ${native} (for a verb, the infinitive; for a noun, with its ${native} article).`,
    `  "note": one short sentence in ${native} about grammar or usage, only when it helps. Otherwise null.`,
    '  "example": a short example sentence in ' + learning + ', or null.',
    '  "gender": "m" or "f" for nouns, otherwise null. "level": the CEFR level of the word (A1, A2, B1 or B2).',
    '  "tag": a grammar label if one applies ("passé composé", "subjonctif"), otherwise null.',
    'Never invent a meaning to fit the sentence: if the word is used figuratively, give the dictionary meaning in "trans" and the figurative one in "here".',
  ].join('\n');
}

export const ANNOTATOR_SCHEMA = {
  type: 'object',
  properties: {
    spans: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sentence: { type: 'string' },
          surface: { type: 'string' },
          here: { type: 'string' },
          nativeMarks: { type: 'array', items: { type: 'string' } },
          mark: { type: 'boolean' },
          lexeme: { type: ['string', 'null'] },
          gloss: {
            type: ['object', 'null'],
            properties: {
              trans: { type: 'string' },
              note: { type: ['string', 'null'] },
              example: { type: ['string', 'null'] },
              tag: { type: ['string', 'null'] },
              gender: { type: ['string', 'null'], enum: ['m', 'f', null] },
              level: { type: ['string', 'null'], enum: ['A1', 'A2', 'B1', 'B2', null] },
            },
            required: ['trans', 'note', 'example', 'tag', 'gender', 'level'],
            additionalProperties: false,
          },
        },
        required: ['sentence', 'surface', 'here', 'nativeMarks', 'mark', 'lexeme', 'gloss'],
        additionalProperties: false,
      },
    },
  },
  required: ['spans'],
  additionalProperties: false,
} as const;
