-- 0014 · box 1 means "again today"
--
-- A card that has just been missed is due the same day, not tomorrow: the results screen offers
-- to repeat exactly those cards, and a card scheduled for tomorrow cannot be repeated now. Only
-- the column comment changes; the intervals themselves are a client constant (BOX_DAYS).

comment on column public.flashcards.box is
  'Leitner box 1..6. Right swipe: box + 1 (capped at 6). Wrong: back to 1. Box 1 is due the same day; from box 2 on the interval doubles (2, 4, 8, 16, 32 days).';
