// Reading and growing the shared dictionary (`lexemes` + `lexeme_glosses`).
//
// Both generators go through here: `generate-reading` for every word in a text, `end-conversation`
// for the words worth saving from a call. That is the point of the helper — a word resolved two
// different ways by two functions would be two rows, and the learner's card would stop matching
// the text it came from.

import { toLemma } from './lemma.ts';

// deno-lint-ignore no-explicit-any
type Db = any;

export type Pos = 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'other';
export const POS: Pos[] = ['noun', 'verb', 'adj', 'adv', 'phrase', 'other'];

export interface Candidate {
  id: string;
  lemma: string;
  pos: Pos;
  sense: number;
  /** The gloss in the caller's native language, or null when only other languages have one. */
  trans: string | null;
}

export interface GlossInput {
  trans: string;
  note?: string | null;
  example?: string | null;
  tag?: string | null;
  level?: string | null;
  gender?: 'm' | 'f' | null;
}

export interface ResolveInput {
  /** As written in the text; normalised here, never by the caller. */
  lemma: string;
  pos: Pos;
  /** A candidate id the model picked as fitting this context, or null for "none of them". */
  lexeme?: string | null;
  /** A fresh gloss, when the model had no fitting candidate (or the candidate lacked one). */
  gloss?: GlossInput | null;
}

const key = (lemma: string, pos: string) => `${lemma}\u0000${pos}`;

/**
 * Every sense of the given words that the dictionary already holds, keyed by `lemma\0pos`, with
 * the gloss in `nativeLanguage` when there is one. This is what the annotator is offered so it can
 * reuse an existing meaning instead of inventing a parallel one.
 */
export async function findCandidates(
  db: Db,
  language: string,
  nativeLanguage: string,
  words: { lemma: string; pos: Pos }[],
): Promise<Map<string, Candidate[]>> {
  const out = new Map<string, Candidate[]>();
  const lemmas = [...new Set(words.map((w) => toLemma(w.lemma, language)))].filter(Boolean);
  if (!lemmas.length) return out;

  const { data, error } = await db
    .from('lexemes')
    .select('id, lemma, pos, sense, lexeme_glosses(native_language, trans)')
    .eq('language', language)
    .in('lemma', lemmas);
  if (error) throw new Error(`lexeme lookup failed: ${error.message}`);

  for (const row of data ?? []) {
    const gloss = (row.lexeme_glosses ?? []).find(
      (g: { native_language: string }) => g.native_language === nativeLanguage,
    );
    const list = out.get(key(row.lemma, row.pos)) ?? [];
    list.push({
      id: row.id,
      lemma: row.lemma,
      pos: row.pos,
      sense: row.sense,
      trans: gloss?.trans ?? null,
    });
    out.set(key(row.lemma, row.pos), list);
  }
  for (const list of out.values()) list.sort((a, b) => a.sense - b.sense);
  return out;
}

/** Adds a gloss for a language that does not have one yet; existing glosses are left alone. */
async function addGloss(
  db: Db,
  lexemeId: string,
  nativeLanguage: string,
  gloss: GlossInput,
): Promise<void> {
  const { error } = await db.from('lexeme_glosses').upsert(
    {
      lexeme_id: lexemeId,
      native_language: nativeLanguage,
      trans: gloss.trans,
      note: gloss.note ?? null,
    },
    { onConflict: 'lexeme_id,native_language', ignoreDuplicates: true },
  );
  if (error) throw new Error(`gloss insert failed: ${error.message}`);
}

/**
 * The id of the lexeme this word belongs to, creating it when the dictionary has nothing that
 * fits. A model that refuses every offered candidate gets a new sense of the same spelling rather
 * than a second row for the same meaning.
 *
 * Concurrent generations can race on the same new word; the unique key catches it and we re-read
 * the winner's row instead of failing the text.
 */
export async function resolveLexeme(
  db: Db,
  language: string,
  nativeLanguage: string,
  input: ResolveInput,
  candidates: Map<string, Candidate[]>,
): Promise<string | null> {
  const lemma = toLemma(input.lemma, language);
  if (!lemma) return null;
  const pos: Pos = POS.includes(input.pos) ? input.pos : 'other';
  const existing = candidates.get(key(lemma, pos)) ?? [];

  // The model picked a sense that already exists. Only trust an id we actually offered it.
  const picked = input.lexeme ? existing.find((c) => c.id === input.lexeme) : undefined;
  if (picked) {
    if (!picked.trans && input.gloss?.trans) {
      await addGloss(db, picked.id, nativeLanguage, input.gloss);
      picked.trans = input.gloss.trans;
    }
    return picked.trans ? picked.id : null;
  }

  // Nothing fits, so this is a new word or a new sense of a known spelling.
  if (!input.gloss?.trans) return null;
  const sense = existing.length ? Math.max(...existing.map((c) => c.sense)) + 1 : 1;

  const { data, error } = await db
    .from('lexemes')
    .upsert(
      {
        language,
        lemma,
        pos,
        sense,
        gender: input.gloss.gender ?? null,
        level: input.gloss.level ?? null,
        tag: input.gloss.tag ?? null,
        example: input.gloss.example ?? null,
      },
      { onConflict: 'language,lemma,pos,sense', ignoreDuplicates: true },
    )
    .select('id');
  if (error) throw new Error(`lexeme insert failed: ${error.message}`);

  let id: string | undefined = data?.[0]?.id;
  if (!id) {
    // Another generation inserted this exact sense first; take theirs.
    const { data: won } = await db
      .from('lexemes')
      .select('id')
      .eq('language', language)
      .eq('lemma', lemma)
      .eq('pos', pos)
      .eq('sense', sense)
      .maybeSingle();
    id = won?.id;
  }
  if (!id) return null;

  await addGloss(db, id, nativeLanguage, input.gloss);
  const list = candidates.get(key(lemma, pos)) ?? [];
  list.push({ id, lemma, pos, sense, trans: input.gloss.trans });
  candidates.set(key(lemma, pos), list);
  return id;
}
