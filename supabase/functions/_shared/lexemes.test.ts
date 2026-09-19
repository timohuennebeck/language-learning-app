// Tests for resolving a word to a dictionary entry.
//
// The case that matters is the quiet one: a flashcard saved before the dictionary existed was
// backfilled with `pos = 'other'`, because a card's `front` does not say what part of speech it is.
// The lemmatiser will call that same word a noun. If the lookup keyed on both lemma and part of
// speech, the backfilled row would be invisible, a second lexeme would be created, and the
// learner's card would point at the one the text does not use — so a word they have studied for
// weeks would render as new, with nothing anywhere reporting a failure.

import test from 'node:test';
import assert from 'node:assert/strict';

import { findCandidates, resolveLexeme, type Candidate } from './lexemes.ts';

/** Stands in for the admin client: serves fixed rows and records what was inserted. */
function fakeDb(rows: Record<string, unknown>[]) {
  const inserted: { table: string; row: Record<string, unknown> }[] = [];
  const db = {
    from(table: string) {
      const chain = {
        select: () => chain,
        eq: () => chain,
        in: () => Promise.resolve({ data: rows, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        upsert(row: Record<string, unknown>) {
          inserted.push({ table, row });
          return {
            select: () =>
              Promise.resolve({ data: [{ id: `new-${inserted.length}` }], error: null }),
            then: (r: (v: { error: null }) => unknown) => Promise.resolve({ error: null }).then(r),
          };
        },
      };
      return chain;
    },
  };
  return { db, inserted };
}

const BACKFILLED = [
  {
    id: 'lex-cafe-other',
    lemma: 'café',
    pos: 'other',
    sense: 1,
    lexeme_glosses: [{ native_language: 'de', trans: 'der Kaffee' }],
  },
];

test('a backfilled entry is offered even though the text calls the word a noun', async () => {
  const { db } = fakeDb(BACKFILLED);
  const candidates = await findCandidates(db, 'fr', 'de', [{ lemma: 'café', pos: 'noun' }]);
  const offered = candidates.get('café') ?? [];
  assert.deepEqual(
    offered.map((c: Candidate) => [c.id, c.pos, c.trans]),
    [['lex-cafe-other', 'other', 'der Kaffee']],
  );
});

test('picking that entry reuses it instead of minting a parallel word', async () => {
  const { db, inserted } = fakeDb(BACKFILLED);
  const candidates = await findCandidates(db, 'fr', 'de', [{ lemma: 'café', pos: 'noun' }]);
  const id = await resolveLexeme(
    db,
    'fr',
    'de',
    { lemma: 'café', pos: 'noun', lexeme: 'lex-cafe-other' },
    candidates,
  );
  assert.equal(id, 'lex-cafe-other', 'the learner keeps the card they already have');
  assert.equal(inserted.length, 0, 'nothing was written');
});

test('the lemma is normalised, so "Le Café" finds the same entry', async () => {
  const { db } = fakeDb(BACKFILLED);
  const candidates = await findCandidates(db, 'fr', 'de', [{ lemma: 'Le Café', pos: 'noun' }]);
  assert.ok(candidates.get('café'), 'article stripped and lowercased before the lookup');
});

test('an id that was never offered is refused', async () => {
  const { db, inserted } = fakeDb(BACKFILLED);
  const candidates = await findCandidates(db, 'fr', 'de', [{ lemma: 'café', pos: 'noun' }]);
  const id = await resolveLexeme(
    db,
    'fr',
    'de',
    // A hallucinated id, with no gloss to fall back on.
    { lemma: 'café', pos: 'noun', lexeme: 'lex-something-else' },
    candidates,
  );
  assert.equal(id, null);
  assert.equal(inserted.length, 0);
});

test('a genuinely new sense is numbered within its own part of speech', async () => {
  const { db, inserted } = fakeDb([
    {
      id: 'lex-tour-f',
      lemma: 'tour',
      pos: 'noun',
      sense: 1,
      lexeme_glosses: [{ native_language: 'de', trans: 'der Turm' }],
    },
    { id: 'lex-tour-v', lemma: 'tour', pos: 'verb', sense: 1, lexeme_glosses: [] },
  ]);
  const candidates = await findCandidates(db, 'fr', 'de', [{ lemma: 'tour', pos: 'noun' }]);
  const id = await resolveLexeme(
    db,
    'fr',
    'de',
    {
      lemma: 'tour',
      pos: 'noun',
      lexeme: null,
      gloss: { trans: 'die Runde', note: null, example: null, tag: null, gender: 'm', level: 'B1' },
    },
    candidates,
  );
  assert.equal(id, 'new-1');
  // Sense 2 of the noun, not sense 2 across every part of speech.
  assert.equal(inserted[0].row.sense, 2);
  assert.equal(inserted[0].row.pos, 'noun');
});

test('a word with no fitting entry and no gloss is left untappable rather than guessed', async () => {
  const { db, inserted } = fakeDb([]);
  const candidates = await findCandidates(db, 'fr', 'de', [{ lemma: 'flonflon', pos: 'noun' }]);
  const id = await resolveLexeme(db, 'fr', 'de', { lemma: 'flonflon', pos: 'noun' }, candidates);
  assert.equal(id, null);
  assert.equal(inserted.length, 0);
});
