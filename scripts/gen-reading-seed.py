"""Generates the seeded vocabulary and the dev reading text.

Writes supabase/seed/vocabulary.sql (every seeded lexeme and its German gloss) and
supabase/seed/reading.sql (the text "Mardi matin" in the real document shape).

Offsets are computed here the way the edge function's validator computes them — find the quoted
surface in the sentence — so the seed exercises exactly the same contract the generator must meet.
"""
import json, uuid

NS = uuid.UUID('6ba7b811-9dad-11d1-80b4-00c04fd430c8')
def lex_id(lemma, pos): return str(uuid.uuid5(NS, f'yori:lexeme:fr:{lemma}:{pos}:1'))

# lemma -> (pos, gender, trans_de, note, level)
VOCAB = {
    'aller':        ('verb',   None, 'gehen',                      'Passé composé mit être: „je suis allée“ — das -e zeigt, dass eine Frau spricht.', 'A2'),
    'près de':      ('phrase', None, 'in der Nähe von',            None, 'A2'),
    'canal':        ('noun',   'm',  'der Kanal',                  None, 'B1'),
    'serveur':      ('noun',   'm',  'der Kellner',                None, 'A2'),
    'demander':     ('verb',   None, 'fragen',                     'Nicht „verlangen“: „demander“ heißt fragen.', 'A2'),
    'vouloir':      ('verb',   None, 'wollen',                     'Imparfait „voulais“ nach „si“ in der indirekten Rede.', 'A2'),
    'crème':        ('noun',   'm',  'der Milchkaffee',            '„un crème“ ist maskulin, obwohl „la crème“ feminin ist.', 'B1'),
    'allongé':      ('noun',   'm',  'der verlängerte Espresso',   None, 'B1'),
    'comprendre':   ('verb',   None, 'verstehen',                  None, 'A2'),
    'tout de suite':('phrase', None, 'sofort',                     None, 'A2'),
    'sourire':      ('verb',   None, 'lächeln',                    None, 'B1'),
    'expliquer':    ('verb',   None, 'erklären',                   None, 'A2'),
    'différence':   ('noun',   'f',  'der Unterschied',            None, 'A2'),
    'commander':    ('verb',   None, 'bestellen',                  None, 'A2'),
    'pain au chocolat': ('noun','m', 'das Schokobrötchen',         None, 'A2'),
    "s'asseoir":    ('verb',   None, 'sich setzen',                'Reflexiv und mit être: „je me suis assise“.', 'B1'),
    'fenêtre':      ('noun',   'f',  'das Fenster',                None, 'A1'),
    'sortir':       ('verb',   None, 'herausholen',                '„sortir“ heißt hier herausholen, nicht hinausgehen.', 'B1'),
    'carnet':       ('noun',   'm',  'das Heft',                   None, 'B1'),
    'à côté de':    ('phrase', None, 'neben',                      None, 'A2'),
    'parler':       ('verb',   None, 'sprechen',                   None, 'A1'),
    'vite':         ('adv',    None, 'schnell',                    None, 'A1'),
    'mot':          ('noun',   'm',  'das Wort',                   None, 'A1'),
    'revenir':      ('verb',   None, 'zurückkommen',               None, 'A2'),
    'répondre':     ('verb',   None, 'antworten',                  None, 'A2'),
    'partir':       ('verb',   None, 'weggehen',                   None, 'A2'),
    'demain':       ('adv',    None, 'morgen',                     None, 'A1'),
    'peut-être':    ('adv',    None, 'vielleicht',                 None, 'A2'),
    # The dev user's deck. `café`, `chaud` and `addition` are also in the text above, which is the
    # point: they render tinted by their Leitner box while the rest of the text does not.
    'café':         ('noun',   'm',  'der Kaffee',                 None, 'A1'),
    'chaud':        ('adj',    None, 'heiß',                       None, 'A1'),
    'addition':     ('noun',   'f',  'die Rechnung',               None, 'A2'),
    'à emporter':   ('phrase', None, 'zum Mitnehmen',              None, 'A2'),
    'se débrouiller': ('verb', None, 'sich zurechtfinden',         None, 'B1'),
    'pourtant':     ('adv',    None, 'dennoch',                    None, 'B1'),
    'quartier':     ('noun',   'm',  'das Viertel',                None, 'A2'),
    'rendez-vous':  ('noun',   'm',  'der Termin',                 None, 'A2'),
    'trajet':       ('noun',   'm',  'der Weg',                    None, 'B1'),
    'déjà':         ('adv',    None, 'schon',                      None, 'A1'),
    'lait':         ('noun',   'm',  'die Milch',                  None, 'A1'),
    's’il vous plaît': ('phrase', None, 'bitte',                   None, 'A1'),
    'emménager':    ('verb',   None, 'einziehen',                  None, 'B1'),
    'carrefour':    ('noun',   'm',  'die Kreuzung',               None, 'B1'),
    'soudain':      ('adv',    None, 'plötzlich',                  None, 'B1'),
}

# The dev user's Leitner file: (front as saved, lemma, example, box, due offset, reviews, lapses).
# Twelve due today across the six boxes, three resting higher up, so "12 Karten fällig" is real.
DECK = [
    ('à emporter',      'à emporter',      'un café à emporter',            1,  0, 5, 2),
    ('l’addition',      'addition',        'L’addition, s’il vous plaît.',  1,  0, 3, 1),
    ('se débrouiller',  'se débrouiller',  'Je me débrouille en français.', 1,  0, 4, 2),
    ('pourtant',        'pourtant',        'Il pleut, pourtant je sors.',   1,  0, 2, 1),
    ('le quartier',     'quartier',        'J’habite dans ce quartier.',    2,  0, 6, 1),
    ('le rendez-vous',  'rendez-vous',     'J’ai un rendez-vous à midi.',   2,  0, 3, 0),
    ('le trajet',       'trajet',          'Le trajet dure vingt minutes.', 2,  0, 3, 0),
    ('déjà',            'déjà',            'Tu es déjà là ?',               3,  0, 5, 0),
    ('le lait',         'lait',            'un café avec du lait',          3,  0, 4, 0),
    ('chaud',           'chaud',           'un café chaud',                 4,  0, 7, 0),
    ('le café',         'café',            'un café, s’il vous plaît',      4,  0, 8, 0),
    ('s’il vous plaît', 's’il vous plaît', 'Un latte, s’il vous plaît.',    5,  0, 9, 0),
    ('emménager',       'emménager',       'On emménage samedi.',           4,  5, 4, 1),
    ('le carrefour',    'carrefour',       'Tournez au carrefour.',         5, 12, 6, 0),
    ('soudain',         'soudain',         'Soudain, il s’est arrêté.',     6, 25, 9, 0),
]
BOX_DAYS = [0, 2, 4, 8, 16, 32]   # lib/boxes.ts; last_reviewed_at = due minus the box's interval

# (source, native, [(surface, lemma, here, [nativeMarks], mark)])
SECTIONS = [
 [
  ("Hier, je suis allée dans un petit café près du canal.",
   "Gestern bin ich in ein kleines Café am Kanal gegangen.",
   [("je suis allée", 'aller', 'ich bin gegangen', ["bin ich", "gegangen"], True),
    ("café", 'café', 'Café', ["Café"], False),
    ("près du", 'près de', 'in der Nähe des', ["am"], True),
    ("canal", 'canal', 'Kanal', ["Kanal"], False)]),
  ("Le serveur m’a demandé si je voulais un crème ou un allongé.",
   "Der Kellner hat mich gefragt, ob ich einen Milchkaffee oder einen verlängerten Espresso möchte.",
   [("serveur", 'serveur', 'Kellner', ["Kellner"], False),
    ("m’a demandé", 'demander', 'hat mich gefragt', ["hat mich gefragt"], True),
    ("je voulais", 'vouloir', 'ich wollte', ["ich", "möchte"], True),
    ("un crème", 'crème', 'ein Milchkaffee', ["einen Milchkaffee"], True),
    ("un allongé", 'allongé', 'ein verlängerter Espresso', ["einen verlängerten Espresso"], False)]),
  ("Je n’ai pas compris tout de suite, alors il a souri et m’a expliqué la différence.",
   "Ich habe es nicht sofort verstanden, da hat er gelächelt und mir den Unterschied erklärt.",
   [("compris", 'comprendre', 'verstanden', ["verstanden"], False),
    ("tout de suite", 'tout de suite', 'sofort', ["sofort"], True),
    ("souri", 'sourire', 'gelächelt', ["gelächelt"], False),
    ("expliqué", 'expliquer', 'erklärt', ["erklärt"], False),
    ("différence", 'différence', 'Unterschied', ["Unterschied"], False)]),
  ("J’ai commandé un allongé et un pain au chocolat.",
   "Ich habe einen verlängerten Espresso und ein Schokobrötchen bestellt.",
   [("commandé", 'commander', 'bestellt', ["bestellt"], False),
    ("un pain au chocolat", 'pain au chocolat', 'ein Schokobrötchen', ["ein Schokobrötchen"], True)]),
 ],
 [
  ("Je me suis assise près de la fenêtre et j’ai sorti mon carnet.",
   "Ich habe mich ans Fenster gesetzt und mein Heft herausgeholt.",
   [("Je me suis assise", "s'asseoir", 'ich habe mich gesetzt', ["habe mich", "gesetzt"], True),
    ("fenêtre", 'fenêtre', 'Fenster', ["Fenster"], False),
    ("sorti", 'sortir', 'herausgeholt', ["herausgeholt"], False),
    ("carnet", 'carnet', 'Heft', ["Heft"], True)]),
  ("À côté de moi, deux femmes parlaient très vite.",
   "Neben mir sprachen zwei Frauen sehr schnell.",
   [("À côté de", 'à côté de', 'neben', ["Neben"], True),
    ("parlaient", 'parler', 'sprachen', ["sprachen"], False),
    ("vite", 'vite', 'schnell', ["schnell"], True)]),
  ("Je n’ai compris qu’un mot sur trois.",
   "Ich habe nur jedes dritte Wort verstanden.",
   [("compris", 'comprendre', 'verstanden', ["verstanden"], False),
    ("mot", 'mot', 'Wort', ["Wort"], False)]),
  ("Quand le serveur est revenu, il m’a demandé si tout allait bien.",
   "Als der Kellner zurückkam, fragte er mich, ob alles in Ordnung sei.",
   [("serveur", 'serveur', 'Kellner', ["Kellner"], False),
    ("est revenu", 'revenir', 'zurückkam', ["zurückkam"], True),
    ("m’a demandé", 'demander', 'fragte mich', ["fragte er mich"], False)]),
 ],
 [
  ("J’ai répondu que oui, et que le pain au chocolat était encore chaud.",
   "Ich habe geantwortet, dass ja, und dass das Schokobrötchen noch warm war.",
   [("répondu", 'répondre', 'geantwortet', ["geantwortet"], False),
    ("pain au chocolat", 'pain au chocolat', 'Schokobrötchen', ["Schokobrötchen"], False),
    ("chaud", 'chaud', 'warm', ["warm"], True)]),
  ("Avant de partir, j’ai demandé l’addition.",
   "Bevor ich ging, habe ich die Rechnung verlangt.",
   [("partir", 'partir', 'weggehen', ["ging"], False),
    ("l’addition", 'addition', 'die Rechnung', ["die Rechnung"], True)]),
  ("Le serveur a souri : « À demain, peut-être ? »",
   "Der Kellner lächelte: „Bis morgen, vielleicht?“",
   [("souri", 'sourire', 'lächelte', ["lächelte"], False),
    ("demain", 'demain', 'morgen', ["morgen"], True),
    ("peut-être", 'peut-être', 'vielleicht', ["vielleicht"], True)]),
 ],
]

def build():
    used, sections, sid = set(), [], 0
    for sec in SECTIONS:
        sentences = []
        for source, native, spans in sec:
            sid += 1
            out = []
            for surface, lemma, here, marks, mark in spans:
                at = source.find(surface)
                assert at >= 0, f'surface {surface!r} not in {source!r}'
                for m in marks:
                    assert m in native, f'mark {m!r} not in {native!r}'
                assert lemma in VOCAB, lemma
                used.add(lemma)
                s = {'at': at, 'len': len(surface), 'lexeme': lex_id(lemma, VOCAB[lemma][0]),
                     'here': here, 'nativeMarks': marks}
                if mark: s['mark'] = True
                out.append(s)
            out.sort(key=lambda s: s['at'])
            for a, b in zip(out, out[1:]):
                assert a['at'] + a['len'] <= b['at'], f'overlapping spans in {source!r}'
            sentences.append({'id': f's{sid}', 'source': source, 'native': native, 'spans': out})
        sections.append({'sentences': sentences})
    return {'title': 'Mardi matin', 'sections': sections}, used

def sql_str(v):
    return 'null' if v is None else "'" + v.replace("'", "''") + "'"


NL = ',\n'
DEV_USER = "'00000000-0000-0000-0000-000000000001'"

content, used = build()
words = sum(len(s['source'].split()) for sec in content['sections'] for s in sec['sentences'])
ids = sorted({sp['lexeme'] for sec in content['sections'] for s in sec['sentences'] for sp in s['spans']})

# --- vocabulary.sql: every seeded lexeme, text and deck alike, so the ids can only agree --------
deck_lemmas = {lemma for _, lemma, *_ in DECK}
rows, glosses = [], []
for lemma in sorted(used | deck_lemmas):
    pos, gender, trans, note, level = VOCAB[lemma]
    rows.append(f"  ('{lex_id(lemma, pos)}', 'fr', {sql_str(lemma)}, '{pos}', "
                f"{sql_str(gender)}, {sql_str(level)})")
    glosses.append(f"  ('{lex_id(lemma, pos)}', 'de', {sql_str(trans)}, {sql_str(note)}, true)")

vocabulary = f"""-- The seeded French vocabulary, with German glosses (docs/lesetext-plan.md §1).
--
-- Generated by `scripts/gen-reading-seed.py`; edit the word lists there, not here. This file owns
-- every lexeme the other seeds use — the dev user's deck and the reading text both join it by
-- lemma — so a word that appears in both, like `café`, is one row with one id.
--
-- Ids are uuid5 of (language, lemma, pos, sense), so regenerating produces the same file and the
-- reading text's spans keep pointing at the right words.

insert into public.lexemes (id, language, lemma, pos, gender, level) values
{NL.join(rows)}
on conflict (language, lemma, pos, sense) do nothing;

insert into public.lexeme_glosses (lexeme_id, native_language, trans, note, verified) values
{NL.join(glosses)}
on conflict (lexeme_id, native_language) do nothing;
"""

# --- flashcards.sql: the deck, joining the vocabulary by lemma ----------------------------------
cards = []
for front, lemma, _example, box, due_in, reviews, lapses in DECK:
    pos, _, trans, _, _ = VOCAB[lemma]
    due = 'current_date' if due_in == 0 else f'current_date + {due_in}'
    cards.append(
        f"  ({sql_str(front)}, '{lex_id(lemma, pos)}', {sql_str(trans)}, "
        f"{box}, {due}, {reviews}, {lapses})")

flashcards = f"""-- The dev user's Leitner file (docs/lesetext-plan.md §1).
--
-- Generated by `scripts/gen-reading-seed.py`. Each card is about a lexeme from `vocabulary.sql`,
-- which is what lets the reading text tint a word the learner has a card for: the text's span and
-- the card point at the same row. `front`/`back` are the learner's own copy of it; the example
-- sentence lives on the lexeme, not the card (migration 0015).
--
-- Twelve cards are due today across the six boxes and three rest higher up, so "12 Karten fällig"
-- on the home screen is real. `last_reviewed_at` is the day each card's own schedule implies (due
-- minus that box's interval), so "gelernt" and "in 30 Tagen" cannot disagree over seeded history.

with v (front, lexeme_id, back, box, due, reviews, lapses) as (values
{NL.join(cards)}
)
insert into public.flashcards
  (user_id, language, front, back, back_language, lexeme_id, box, due, reviews, lapses,
   last_reviewed_at)
select {DEV_USER}, 'fr', v.front, v.back, 'de', v.lexeme_id::uuid, v.box, v.due,
       v.reviews, v.lapses,
       (v.due - (array[0, 2, 4, 8, 16, 32])[v.box])::timestamptz
from v
on conflict (user_id, lexeme_id) do nothing;
"""

# --- reading.sql: the text -----------------------------------------------------------------------
reading = f"""-- Dev reading text "Mardi matin" (docs/lesetext-plan.md §2).
--
-- Generated by `scripts/gen-reading-seed.py`; edit the text there, not here. Every span's offsets
-- were computed by finding the quoted surface in its sentence, exactly as `generate-reading`'s
-- validator does, so this seed exercises the contract the generator has to meet. The words come
-- from `vocabulary.sql`.

insert into public.reading_texts
  (id, user_id, language, native_language, status, stage, level, topic, title, content,
   lexeme_ids, section_count, word_count, minutes, current_section, writer_model,
   annotator_model, prompt_version, ready_at)
values (
  'dddddddd-0000-0000-0000-000000000001',
  {DEV_USER},
  'fr', 'de', 'ready', 3, 'B1', 'Café in Paris', 'Mardi matin',
  '{json.dumps(content, ensure_ascii=False).replace("'", "''")}'::jsonb,
  array[{','.join(f"'{i}'" for i in ids)}]::uuid[],
  {len(content['sections'])}, {words}, 2, 2, 'seed', 'seed', 'seed',
  now() - interval '1 day')
on conflict (id) do nothing;
"""

base = '/home/user/language-learning-app/supabase/seed/'
open(base + 'vocabulary.sql', 'w').write(vocabulary)
open(base + 'flashcards.sql', 'w').write(flashcards)
open(base + 'reading.sql', 'w').write(reading)
print(f"vocabulary: {len(used | deck_lemmas)} lexemes  ·  deck: {len(DECK)} cards  ·  "
      f"text: {words} words, {len(content['sections'])} sections, {len(ids)} words referenced")
