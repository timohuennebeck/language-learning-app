-- 0002 · reference data: languages, app_config, legal_documents
-- Read by everyone (including anonymous sessions); written only with the service role.

-- Drives both language pickers. `learnable = false` renders under "Bald verfügbar".
create table public.languages (
  code             text primary key,
  name_native      text not null,
  is_app_language  boolean not null default false,
  learnable        boolean not null default false,
  sort_order       smallint not null default 0
);

-- Remote configuration, one row per key.
create table public.app_config (
  key          text primary key,
  value        jsonb not null,
  description  text,
  updated_at   timestamptz not null default now()
);
create trigger handle_updated_at before update on public.app_config
  for each row execute function extensions.moddatetime(updated_at);

-- Versioned Nutzungsbedingungen / Datenschutzerklärung, one row per kind, locale and version.
create table public.legal_documents (
  id                     uuid primary key default gen_random_uuid(),
  kind                   public.legal_doc_kind not null,
  locale                 text not null default 'en' references public.languages(code),
  version                text not null,
  title                  text not null,
  content_md             text not null,
  effective_at           timestamptz not null,
  requires_reacceptance  boolean not null default false,
  unique (kind, locale, version)
);
create index legal_documents_current_idx on public.legal_documents (kind, locale, effective_at desc);

alter table public.languages       enable row level security;
alter table public.app_config      enable row level security;
alter table public.legal_documents enable row level security;

create policy "languages are public"       on public.languages       for select to anon, authenticated using (true);
create policy "app_config is public"       on public.app_config      for select to anon, authenticated using (true);
create policy "legal documents are public" on public.legal_documents for select to anon, authenticated using (true);
