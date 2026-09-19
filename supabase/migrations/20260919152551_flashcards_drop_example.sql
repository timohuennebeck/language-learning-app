-- 0015 · the example sentence leaves the card, and the table
--
-- The card shows the word and its translation, nothing else, and nothing writes this column: the
-- deck only carried it through its upsert so the value would survive. If a later Rückblick wants
-- to keep the sentence a word was heard in, it comes back as its own column.

alter table public.flashcards drop column example;
