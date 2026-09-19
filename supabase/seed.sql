-- Seed for local development (`supabase db reset`). Reference data first, then a dev user.
-- Everything here is safe to re-run: reference rows use `on conflict`, the dev user has a fixed id.

-- Languages ---------------------------------------------------------------------------------------
insert into public.languages (code, name_native, is_app_language, learnable, sort_order) values
  ('de', 'Deutsch',   true, false, 1),
  ('en', 'English',   true, true,  2),
  ('es', 'Español',   true, true,  3),
  ('fr', 'Français',  true, true,  4),
  ('it', 'Italiano',  true, false, 5),
  ('pt', 'Português', true, false, 6)
on conflict (code) do update set
  name_native = excluded.name_native,
  is_app_language = excluded.is_app_language,
  learnable = excluded.learnable,
  sort_order = excluded.sort_order;

-- App config --------------------------------------------------------------------------------------
insert into public.app_config (key, value, description) values
  ('min_app_version',          '"1.0.0"', 'Oldest app version allowed to sign in; older builds show the update screen.'),
  ('conversation_max_seconds', '360',     'Hard cut-off for a regular live conversation ("bis zu 6 Minuten").'),
  ('placement_max_seconds',    '120',     'Hard cut-off for the placement call ("Gespräch starten · 2 Min").')
on conflict (key) do update set value = excluded.value, description = excluded.description;

-- Legal documents (placeholder text until the real copy exists) -----------------------------------
insert into public.legal_documents (kind, locale, version, content_md, effective_at)
select
  kind::public.legal_doc_kind,
  locale,
  '2026-09-15',
  '## 1. Lorem ipsum' || E'\n\n' ||
  'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.' || E'\n\n' ||
  '## 2. Dolor sit amet' || E'\n\n' ||
  'At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est lorem ipsum dolor sit amet.' || E'\n\n' ||
  '## 3. Consetetur elitr' || E'\n\n' ||
  'Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis.' || E'\n\n' ||
  '## 4. Takimata sanctus' || E'\n\n' ||
  'Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum.',
  '2026-09-15T00:00:00Z'
from (values ('terms'), ('privacy')) as kinds (kind)
cross join (values ('de'), ('en'), ('es'), ('fr'), ('it'), ('pt')) as locales (locale)
on conflict (kind, locale, version) do nothing;

-- Dev user: dev@yori.app / password · onboarding done, learning French at A2 --------------------
-- Inserting into auth.users directly is only for local seeds; production accounts come from Auth.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'dev@yori.app',
  extensions.crypt('password', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"dev@yori.app","email_verified":true}',
  'email', now(), now(), now()
)
on conflict (provider_id, provider) do nothing;

insert into public.profiles (id, first_name, app_language, active_language, goal_minutes, reminder_time, reminder_repeat, onboarding_completed_at)
values ('00000000-0000-0000-0000-000000000001', 'Maja', 'de', 'fr', 15, '20:30', 'daily', now())
on conflict (id) do nothing;

insert into public.learner_languages (user_id, language, level, level_source, level_assessed_at, target_level, goal)
values ('00000000-0000-0000-0000-000000000001', 'fr', 'A2', 'self', now(), 'B2', 'media')
on conflict (user_id, language) do nothing;

insert into public.legal_acceptances (user_id, document_id, app_version, platform)
select '00000000-0000-0000-0000-000000000001', id, '1.0.0', 'ios'
from public.legal_documents where locale = 'de' and version = '2026-09-15'
on conflict (user_id, document_id) do nothing;

-- The dev user's Leitner file: twelve cards due today, spread over the six boxes, plus three
-- that are already resting in a higher box (so "12 Karten fällig" on the home screen is real).
-- `last_reviewed_at` is the day each card's own schedule implies (due minus that box's interval),
-- so the profile's "gelernt" and "in 30 Tagen" counts cannot disagree over seeded history.
insert into public.flashcards (user_id, language, front, back, back_language, box, due, reviews, lapses, last_reviewed_at) values
  ('00000000-0000-0000-0000-000000000001', 'fr', 'à emporter',      'zum Mitnehmen',       'de', 1, current_date,      5, 2, now() - interval '0 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'l’addition',      'die Rechnung',        'de', 1, current_date,      3, 1, now() - interval '0 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'se débrouiller',  'sich zurechtfinden',  'de', 1, current_date,      4, 2, now() - interval '0 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'pourtant',        'dennoch',             'de', 1, current_date,      2, 1, now() - interval '0 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'le quartier',     'das Viertel',         'de', 2, current_date,      6, 1, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'le rendez-vous',  'der Termin',          'de', 2, current_date,      3, 0, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'le trajet',       'der Weg',             'de', 2, current_date,      3, 0, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'déjà',            'schon',               'de', 3, current_date,      5, 0, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'le lait',         'die Milch',           'de', 3, current_date,      4, 0, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'chaud',           'heiß',                'de', 4, current_date,      7, 0, now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'le café',         'der Kaffee',          'de', 4, current_date,      8, 0, now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 's’il vous plaît', 'bitte',               'de', 5, current_date,      9, 0, now() - interval '16 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'emménager',       'einziehen',           'de', 4, current_date + 5,  4, 1, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'le carrefour',    'die Kreuzung',        'de', 5, current_date + 12, 6, 0, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000001', 'fr', 'soudain',         'plötzlich',           'de', 6, current_date + 25, 9, 0, now() - interval '7 days')
on conflict (user_id, language, front) do nothing;
