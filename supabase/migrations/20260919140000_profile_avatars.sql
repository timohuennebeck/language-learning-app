-- 0012 · profile pictures
-- The picture itself lives in the public `avatars` bucket; the profile row keeps the object path
-- ('<user_id>/<random>.jpg') and the app resolves it to a public URL, like `scenarios`.

alter table public.profiles add column avatar_storage_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,                                        -- 5 MB; the app re-encodes to ~512 px first
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- The bucket is public, so the picture itself is served from the CDN without a policy. This
-- select policy only governs the API, and it is owner-only on purpose: a bucket-wide read would
-- let anyone `list()` the folders and walk every user's pictures.
create policy "own avatar: read" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "own avatar: insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "own avatar: update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "own avatar: delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
