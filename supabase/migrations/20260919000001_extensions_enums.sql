-- 0001 · extensions and enums
-- moddatetime stamps `updated_at` on update (built-in trigger; the only trigger in the schema).
create extension if not exists moddatetime with schema extensions;

create type public.cefr_level          as enum ('A1', 'A2', 'B1', 'B2');
create type public.reminder_repeat     as enum ('daily', 'weekdays', 'weekend');
create type public.learning_goal       as enum ('travel', 'media', 'family', 'work', 'friends', 'fun');
create type public.level_source        as enum ('self', 'placement');
create type public.conversation_kind   as enum ('placement', 'free');   -- 'lesson' is added with Kurs
create type public.conversation_status as enum ('active', 'ended', 'failed');
create type public.legal_doc_kind      as enum ('terms', 'privacy');
create type public.platform            as enum ('ios', 'android', 'web');
