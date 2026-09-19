-- 0017 · a flashcard is a word, not a spelling (docs/lesetext-plan.md §1)
--
-- The card's identity moves from the text it was saved from to the lexeme it is about. That is what
-- lets a reading text tint "nous allons" from a card saved as "je suis allée": both point at the
-- same row. `front`/`back`/`example` stay as the learner's copy, so the card they see never changes
-- under them; `language` stays denormalised for the deck's (user_id, language, due) index.

alter table public.flashcards
  add column lexeme_id uuid references public.lexemes(id) on delete restrict;

-- Backfill. Nothing creates flashcards yet (the Rückblick's "Wörter speichern" is unwired), so in
-- practice this runs over an empty table; it is written to be correct if it does not.
insert into public.lexemes (language, lemma, pos)
select distinct f.language, lower(btrim(f.front)), 'other'::public.lexeme_pos
from public.flashcards f
on conflict (language, lemma, pos, sense) do nothing;

insert into public.lexeme_glosses (lexeme_id, native_language, trans)
select distinct on (l.id, f.back_language) l.id, f.back_language, f.back
from public.flashcards f
join public.lexemes l
  on l.language = f.language and l.lemma = lower(btrim(f.front)) and l.pos = 'other' and l.sense = 1
on conflict (lexeme_id, native_language) do nothing;

update public.flashcards f
set lexeme_id = l.id
from public.lexemes l
where l.language = f.language and l.lemma = lower(btrim(f.front))
  and l.pos = 'other' and l.sense = 1;

alter table public.flashcards alter column lexeme_id set not null;

-- Two cards for one word are the same card, whichever form each was saved from.
alter table public.flashcards drop constraint flashcards_user_id_language_front_key;
alter table public.flashcards add constraint flashcards_user_lexeme_key unique (user_id, lexeme_id);

comment on column public.flashcards.lexeme_id is
  'The word this card is about. The join key a reading text uses to tint an inflected form by this card''s box.';
comment on column public.flashcards.front is
  'The learner''s copy of the lexeme, as it was saved. Kept on the row so an edited gloss never changes a card underneath them.';
