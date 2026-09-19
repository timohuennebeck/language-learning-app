-- 0004 · legal_acceptances and devices

create table public.legal_acceptances (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  document_id  uuid not null references public.legal_documents(id),
  accepted_at  timestamptz not null default now(),
  app_version  text,
  platform     public.platform,
  unique (user_id, document_id)
);
create index legal_acceptances_document_idx on public.legal_acceptances (document_id);

create table public.devices (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  expo_push_token  text unique,
  platform         public.platform not null,
  app_version      text,
  locale           text,
  timezone         text,
  push_enabled     boolean not null default false,
  last_seen_at     timestamptz not null default now()
);
create index devices_user_idx on public.devices (user_id);

alter table public.legal_acceptances enable row level security;
alter table public.devices           enable row level security;

create policy "own acceptances: read"   on public.legal_acceptances for select to authenticated using ((select auth.uid()) = user_id);
create policy "own acceptances: insert" on public.legal_acceptances for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "own devices: read"   on public.devices for select to authenticated using ((select auth.uid()) = user_id);
create policy "own devices: insert" on public.devices for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own devices: update" on public.devices for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own devices: delete" on public.devices for delete to authenticated using ((select auth.uid()) = user_id);
