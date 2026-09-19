-- 0006 · profiles.daily_goal_minutes → goal_minutes; legal_documents.title dropped
-- (the label per kind lives in the app's locale files: common.terms / common.privacy).

alter table public.profiles rename column daily_goal_minutes to goal_minutes;
alter table public.profiles rename constraint profiles_daily_goal_minutes_check to profiles_goal_minutes_check;

alter table public.legal_documents drop column title;
