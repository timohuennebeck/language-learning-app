-- 0017 · a flashcard is a word, not a spelling (docs/lesetext-plan.md §1)
--
-- The card's identity moves from the text it was saved from to the lexeme it is about. That is what
-- lets a reading text tint "nous allons" from a card saved as "je suis allée": both point at the
-- same row. `front` and `back` stay as the learner's copy, so the card they see never changes
-- under them; `language` stays denormalised for the deck's (user_id, language, due) index.

alter table public.flashcards
  add column lexeme_id uuid references public.lexemes(id) on delete restrict;

-- Backfill. A card's `front` is how the learner saved it ("le café"), not a dictionary form, so it
-- has to be normalised the way `_shared/lemma.ts` does — otherwise a generated text containing
-- "café" would mint a second lexeme and the learner's card would never tint it. This is a copy of
-- that function, which is why it is dropped again at the end: the app's version is the only one
-- that is allowed to survive this migration.
create function pg_temp.backfill_lemma(word text, language text) returns text
language sql immutable as $$
  select regexp_replace(
    regexp_replace(
      regexp_replace(lower(btrim(normalize(word, NFC))), '\s+', ' ', 'g'),
      '^[\s"“”„«»''‘’(\[{.,;:!?¿¡…—–-]+|[\s"“”„«»(\[{.,;:!?…—–-]+$', '', 'g'),
    case language
      when 'fr' then '^(les |le |la |des |une |un |de la |du |l''|l’)'
      when 'es' then '^(los |las |el |la |unos |unas |un |una )'
      when 'it' then '^(gli |il |lo |la |le |un |uno |una |l''|l’)'
      when 'pt' then '^(os |as |o |a |um |uma )'
      when 'de' then '^(der |die |das |ein |eine )'
      when 'en' then '^(the |a |an )'
      else '^$'
    end, '')
$$;

-- `pos` is unknown for a card saved before this migration, so these land as 'other'. The generator
-- offers every sense of a lemma whatever its part of speech (see `findCandidates`), so a text that
-- later meets "café" as a noun is still offered this row and reuses it.
insert into public.lexemes (language, lemma, pos)
select distinct f.language, pg_temp.backfill_lemma(f.front, f.language), 'other'::public.lexeme_pos
from public.flashcards f
on conflict (language, lemma, pos, sense) do nothing;

insert into public.lexeme_glosses (lexeme_id, native_language, trans)
select distinct on (l.id, f.back_language) l.id, f.back_language, f.back
from public.flashcards f
join public.lexemes l
  on l.language = f.language and l.lemma = pg_temp.backfill_lemma(f.front, f.language)
  and l.pos = 'other' and l.sense = 1
on conflict (lexeme_id, native_language) do nothing;

update public.flashcards f
set lexeme_id = l.id
from public.lexemes l
where l.language = f.language and l.lemma = pg_temp.backfill_lemma(f.front, f.language)
  and l.pos = 'other' and l.sense = 1;

drop function pg_temp.backfill_lemma(text, text);

alter table public.flashcards alter column lexeme_id set not null;

-- Two cards for one word are the same card, whichever form each was saved from.
alter table public.flashcards drop constraint flashcards_user_id_language_front_key;
alter table public.flashcards add constraint flashcards_user_lexeme_key unique (user_id, lexeme_id);

comment on column public.flashcards.lexeme_id is
  'The word this card is about. The join key a reading text uses to tint an inflected form by this card''s box.';
comment on column public.flashcards.front is
  'The learner''s copy of the lexeme, as it was saved. Kept on the row so an edited gloss never changes a card underneath them.';
