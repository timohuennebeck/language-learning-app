-- 0013 · flashcards: six Leitner boxes instead of FSRS state
--
-- The deck is a Leitner file now: every card sits in one of six boxes, a right swipe moves it one
-- box up, a wrong one drops it back into box 1, and the box alone decides when the card returns
-- (1 · 2 · 4 · 8 · 16 · 32 days, a client constant). That leaves the ten FSRS columns and the
-- per-swipe review log without a reader: the optimiser they were collected for no longer exists.

drop table if exists public.flashcard_reviews;

alter table public.flashcards
  drop column stability,
  drop column difficulty,
  drop column state,
  drop column scheduled_days,
  drop column elapsed_days,
  drop column learning_steps,
  add column box smallint not null default 1 check (box between 1 and 6);

-- `reps` counted answers, which is the one FSRS number the boxes still want; every card starts
-- over in box 1, which costs nothing today (no deck writes these columns yet).
alter table public.flashcards rename column reps to reviews;
alter table public.flashcards add constraint flashcards_reviews_check check (reviews >= 0);

-- A box is due on a day, not at a time of day: "fällig am 21.9." beats "fällig um 14:03".
alter table public.flashcards
  alter column due drop default,
  alter column due type date using (due at time zone 'utc')::date,
  alter column due set default current_date;

comment on column public.flashcards.box is
  'Leitner box 1..6. Right swipe: box + 1 (capped at 6). Wrong: back to 1. The interval doubles per box (1, 2, 4, 8, 16, 32 days).';
comment on column public.flashcards.due is
  'The day the card comes back: last_reviewed_at + the new box''s interval.';
comment on column public.flashcards.reviews is 'How often the card was answered at all.';
comment on column public.flashcards.lapses is 'How often the card fell back into box 1.';
