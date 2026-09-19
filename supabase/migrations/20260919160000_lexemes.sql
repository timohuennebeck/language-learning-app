-- 0015 · lexemes: the vocabulary becomes a table (docs/lesetext-plan.md §1)
--
-- A reading text contains surface forms ("je suis allée"); a flashcard contains what the learner
-- saved ("aller"). Neither string can find the other, and explaining "café" afresh inside every
-- text that uses it means the same word explained thirty different ways. Both problems have one
-- answer: a dictionary, shared by every learner of a language, that texts and cards point at by id.

create type public.lexeme_pos as enum ('noun', 'verb', 'adj', 'adv', 'phrase', 'other');

-- One row per word (or fixed phrase) of a learning language, in its dictionary form.
create table public.lexemes (
  id          uuid primary key default gen_random_uuid(),
  language    text not null references public.languages(code),
  lemma       text not null,
  pos         public.lexeme_pos not null,
  sense       smallint not null default 1 check (sense >= 1),
  gender      char(1) check (gender in ('m', 'f')),
  level       public.cefr_level,
  tag         text,
  example     text,
  created_at  timestamptz not null default now(),
  unique (language, lemma, pos, sense)
);

comment on table public.lexemes is
  'The shared dictionary: one row per word of a learning language, in its dictionary form. Not per user.';
comment on column public.lexemes.lemma is
  'Dictionary form, NFC + lowercased + trimmed, one leading article stripped. Diacritics are kept: `ou` and `où` are different words.';
comment on column public.lexemes.sense is
  'Second and further meanings of the same spelling: `allongé` the coffee vs. lying down. Created only when a text needs one.';
comment on column public.lexemes.gender is 'Nouns only; the card front renders `le`/`la` from it.';

-- What a lexeme means, per app language. One French word, up to six glosses.
create table public.lexeme_glosses (
  lexeme_id        uuid not null references public.lexemes(id) on delete cascade,
  native_language  text not null references public.languages(code),
  trans            text not null,
  note             text,
  verified         boolean not null default false,
  created_at       timestamptz not null default now(),
  primary key (lexeme_id, native_language)
);

comment on table public.lexeme_glosses is
  'A lexeme''s meaning in one app language. Split from `lexemes` because the identity of a word does not depend on who reads it: that is what lets a flashcard survive an app-language switch.';
comment on column public.lexeme_glosses.verified is 'A human has looked at this gloss. Nothing sets it yet.';

-- Read by everyone, written only by the edge functions (secret key), like `languages` and
-- `scenarios`. A learner reading a text needs the glosses of words they have never saved.
alter table public.lexemes        enable row level security;
alter table public.lexeme_glosses enable row level security;
create policy "lexemes are public" on public.lexemes
  for select to anon, authenticated using (true);
create policy "lexeme glosses are public" on public.lexeme_glosses
  for select to anon, authenticated using (true);
