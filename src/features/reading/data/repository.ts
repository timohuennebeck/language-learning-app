import { FunctionsHttpError } from '@supabase/supabase-js';

import type {
  Lexeme,
  ReadingBundle,
  ReadingDocument,
  ReadingText,
  WordState,
} from '@/features/reading/data/types';
import type { Tables } from '@/shared/lib/database.types';
import { supabase } from '@/shared/lib/supabase';

const COLUMNS =
  'id, status, stage, error_code, language, native_language, title, topic, content, lexeme_ids, section_count, word_count, minutes, current_section, completed_at, created_at';

type Row = Pick<
  Tables<'reading_texts'>,
  | 'id'
  | 'status'
  | 'stage'
  | 'error_code'
  | 'language'
  | 'native_language'
  | 'title'
  | 'topic'
  | 'content'
  | 'lexeme_ids'
  | 'section_count'
  | 'word_count'
  | 'minutes'
  | 'current_section'
  | 'completed_at'
  | 'created_at'
>;

/** Stable error codes `generate-reading` returns; the UI maps them to copy. */
export class ReadingError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

function toText(row: Row): ReadingText {
  return {
    id: row.id,
    status: row.status,
    stage: row.stage,
    errorCode: row.error_code,
    language: row.language,
    nativeLanguage: row.native_language,
    title: row.title,
    topic: row.topic,
    content: (row.content as ReadingDocument | null) ?? null,
    lexemeIds: row.lexeme_ids ?? [],
    sectionCount: row.section_count ?? 0,
    wordCount: row.word_count ?? 0,
    minutes: row.minutes ?? 0,
    currentSection: row.current_section,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

/** Starts a generation (or re-runs `textId` after a failure) and returns the row to watch. */
export async function generateText(input: {
  language: string;
  topic?: string;
  textId?: string;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ textId: string }>('generate-reading', {
    body: input,
  });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
      throw new ReadingError(payload?.error ?? 'request_failed', payload?.message);
    }
    throw new ReadingError('network', error.message);
  }
  if (!data?.textId) throw new ReadingError('request_failed');
  return data.textId;
}

/** The row on its own — what the preparing screen polls while the text is being written. */
export async function getText(textId: string): Promise<ReadingText> {
  const { data, error } = await supabase
    .from('reading_texts')
    .select(COLUMNS)
    .eq('id', textId)
    .single();
  if (error) throw new Error(error.message);
  return toText(data);
}

/**
 * Everything one text needs to render, in three reads: the document, the words it points at with
 * their meaning in the learner's language, and the learner's own boxes for those words. The third
 * is what tints the text, and it is deliberately a separate read — it changes every time the deck
 * is practised, while the document never does.
 */
export async function getBundle(textId: string, nativeLanguage: string): Promise<ReadingBundle> {
  const text = await getText(textId);
  if (!text.lexemeIds.length) return { text, lexemes: {}, states: {} };

  const [vocabulary, cards] = await Promise.all([
    supabase
      .from('lexemes')
      .select('id, lemma, pos, gender, example, tag, lexeme_glosses(native_language, trans, note)')
      .in('id', text.lexemeIds),
    supabase
      .from('flashcards')
      .select('lexeme_id, box, reviews, lapses')
      .in('lexeme_id', text.lexemeIds),
  ]);
  if (vocabulary.error) throw new Error(vocabulary.error.message);
  // A failed deck read is not worth blocking a text for: it only costs the tints.
  if (cards.error) console.warn('word states unavailable', cards.error.message);

  const lexemes: Record<string, Lexeme> = {};
  for (const row of vocabulary.data ?? []) {
    const gloss =
      row.lexeme_glosses.find((g) => g.native_language === nativeLanguage) ?? row.lexeme_glosses[0];
    if (!gloss) continue;
    lexemes[row.id] = {
      id: row.id,
      lemma: row.lemma,
      pos: row.pos,
      gender: row.gender,
      example: row.example,
      tag: row.tag,
      trans: gloss.trans,
      note: gloss.note,
    };
  }

  const states: Record<string, WordState> = {};
  for (const card of cards.data ?? []) {
    states[card.lexeme_id] = { box: card.box, reviews: card.reviews, lapses: card.lapses };
  }
  return { text, lexemes, states };
}

/** The newest text the learner started and has not finished — the home card's "Weiterlesen". */
export async function getOpenText(userId: string, language: string): Promise<ReadingText | null> {
  const { data, error } = await supabase
    .from('reading_texts')
    .select(COLUMNS)
    .eq('user_id', userId)
    .eq('language', language)
    .eq('status', 'ready')
    .is('completed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toText(data) : null;
}

/** Finishing a section. The server checks the number, so this is the only write the client makes. */
export async function markSectionRead(textId: string, section: number): Promise<void> {
  const { error } = await supabase.rpc('mark_section_read', { text_id: textId, section });
  if (error) throw new Error(error.message);
}

/** "Speichern" on the word screen: the dictionary entry becomes a card in box 1, due today. */
export async function saveWord(input: {
  userId: string;
  language: string;
  nativeLanguage: string;
  lexeme: Lexeme;
}): Promise<void> {
  const { lexeme } = input;
  const article = lexeme.gender === 'm' ? 'le ' : lexeme.gender === 'f' ? 'la ' : '';
  const { error } = await supabase.from('flashcards').upsert(
    {
      user_id: input.userId,
      language: input.language,
      lexeme_id: lexeme.id,
      front: lexeme.pos === 'noun' ? `${article}${lexeme.lemma}` : lexeme.lemma,
      back: lexeme.trans,
      back_language: input.nativeLanguage,
      example: lexeme.example,
    },
    { onConflict: 'user_id,lexeme_id', ignoreDuplicates: true },
  );
  if (error) throw new Error(error.message);
}
