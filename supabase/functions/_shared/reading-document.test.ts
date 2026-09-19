// Tests for the reading document builder. Pure logic, no Deno APIs, so it runs on the repo's Node:
//   npm test
//
// What is worth testing here is not the happy path but the misbehaving model: a quoted phrase that
// is not in the sentence, a highlight that is not in the translation, a word that appears twice.
// Each of those reaches a learner as a wrong explanation if it is not caught here.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertUsable,
  buildDocument,
  findSurface,
  InvalidText,
  type AnnotatorSpan,
  type WriterText,
} from './reading-document.ts';

test('findSurface locates a quoted phrase', () => {
  assert.equal(findSurface('Hier, je suis allée', 'je suis allée'), 6);
  assert.equal(findSurface('Le serveur', 'le café'), -1);
  // The writer capitalises a sentence; the annotator quotes the lemma's casing. Still the same word.
  assert.equal(findSurface('Je me suis assise près', 'je me suis assise'), 0);
  // A repeated word finds its later occurrence when the first one is taken.
  assert.equal(findSurface('un café, un café', 'un café', 1), 9);
});

const TEXT: WriterText = {
  title: ' Mardi matin ',
  sections: [
    {
      sentences: [
        {
          source: 'Hier, je suis allée dans un petit café.',
          native: 'Gestern bin ich in ein kleines Café gegangen.',
        },
      ],
    },
    {
      sentences: [
        {
          source: 'Le café était chaud, le café était bon.',
          native: 'Der Kaffee war heiß, der Kaffee war gut.',
        },
      ],
    },
  ],
};

const SPANS = new Map<string, AnnotatorSpan[]>([
  [
    's1',
    [
      {
        sentence: 's1',
        surface: 'je suis allée',
        here: 'ich bin gegangen',
        nativeMarks: ['bin ich', 'gegangen', 'nicht im Text'],
        mark: true,
        lexeme: 'L-aller',
      },
      {
        sentence: 's1',
        surface: 'café',
        here: 'Café',
        nativeMarks: ['Café'],
        mark: false,
        lexeme: 'L-cafe',
      },
      // Never written: the annotator invented it.
      {
        sentence: 's1',
        surface: 'le vélo',
        here: 'das Fahrrad',
        nativeMarks: [],
        mark: false,
        lexeme: 'L-velo',
      },
      // In the sentence, but no meaning could be resolved for it.
      {
        sentence: 's1',
        surface: 'petit',
        here: 'klein',
        nativeMarks: ['kleines'],
        mark: false,
        lexeme: null,
      },
    ],
  ],
  [
    's2',
    [
      {
        sentence: 's2',
        surface: 'café',
        here: 'Kaffee',
        nativeMarks: ['Kaffee'],
        mark: false,
        lexeme: 'L-cafe',
      },
      {
        sentence: 's2',
        surface: 'café',
        here: 'Kaffee',
        nativeMarks: ['Kaffee'],
        mark: false,
        lexeme: 'L-cafe',
      },
      {
        sentence: 's2',
        surface: 'chaud',
        here: 'heiß',
        nativeMarks: ['heiß'],
        mark: true,
        lexeme: 'L-chaud',
      },
    ],
  ],
]);

const lexemeOf = (sentenceId: string, surface: string) =>
  SPANS.get(sentenceId)?.find((s) => s.surface === surface)?.lexeme ?? null;

const built = () => buildDocument(TEXT, SPANS, lexemeOf);
const EXPECTED = { sections: 3, words: 16, dueLemmas: 3, dueHit: 3 };

test('a span the writer never wrote is dropped', () => {
  const r = built();
  const s1 = r.document.sections[0].sentences[0];
  assert.equal(s1.spans.length, 2);
  assert.ok(r.dropped.some((d) => d.includes('le vélo')));
});

test('a span with no meaning is dropped rather than shown unexplained', () => {
  assert.ok(built().dropped.some((d) => d.includes('petit') && d.includes('lexeme')));
});

test('a highlight the translation does not contain is filtered out', () => {
  const [first] = built().document.sections[0].sentences[0].spans;
  assert.deepEqual(first.nativeMarks, ['bin ich', 'gegangen']);
});

test('offsets address the stored sentence', () => {
  for (const section of built().document.sections) {
    for (const s of section.sentences) {
      for (const span of s.spans) {
        assert.equal(s.source.slice(span.at, span.at + span.len).length, span.len);
        assert.ok(span.at >= 0 && span.at + span.len <= s.source.length);
      }
    }
  }
});

test('the same word twice in one sentence gets two spans, not one twice', () => {
  const s2 = built().document.sections[1].sentences[0];
  assert.deepEqual(
    s2.spans.map((sp) => s2.source.slice(sp.at, sp.at + sp.len)),
    ['café', 'chaud', 'café'],
  );
  assert.deepEqual(
    s2.spans.map((sp) => sp.at),
    [3, 14, 24],
  );
});

test('spans come out in reading order and only the marked ones carry the flag', () => {
  const s1 = built().document.sections[0].sentences[0];
  assert.deepEqual(
    s1.spans.map((s) => s.at),
    [6, 34],
  );
  assert.deepEqual(
    s1.spans.map((s) => s.mark),
    [true, undefined],
  );
});

test('the title is trimmed and every lexeme is listed once', () => {
  const r = built();
  assert.equal(r.document.title, 'Mardi matin');
  assert.deepEqual([...r.lexemeIds].sort(), ['L-aller', 'L-cafe', 'L-chaud']);
});

test('a well-formed text passes', () => {
  assert.doesNotThrow(() => assertUsable(built(), EXPECTED));
});

const rejects = (name: string, mutate: (r: ReturnType<typeof built>) => void, match: RegExp) =>
  test(`rejected: ${name}`, () => {
    const r = built();
    r.document = structuredClone(r.document);
    mutate(r);
    assert.throws(
      () => assertUsable(r, EXPECTED),
      (e: Error) => e instanceof InvalidText && match.test(e.message),
    );
  });

rejects(
  'one section is not a text',
  (r) => void (r.document.sections = [r.document.sections[0]]),
  /sections/,
);
rejects(
  'more sections than asked for',
  (r) => {
    r.document.sections = [...r.document.sections, ...r.document.sections];
  },
  /sections/,
);
rejects(
  'a sentence without a translation',
  (r) => {
    r.document.sections[0].sentences[0].native = '   ';
  },
  /no translation/,
);
rejects('an empty title', (r) => void (r.document.title = ''), /title/);
rejects(
  'nothing tappable',
  (r) => {
    for (const section of r.document.sections) for (const s of section.sentences) s.spans = [];
  },
  /could be explained/,
);

test('rejected: the wrong length', () => {
  assert.throws(() => assertUsable(built(), { ...EXPECTED, words: 100 }), /words/);
});

test("rejected: the learner's due words are missing", () => {
  assert.throws(
    () => assertUsable(built(), { ...EXPECTED, dueLemmas: 20, dueHit: 1 }),
    /due words/,
  );
});
