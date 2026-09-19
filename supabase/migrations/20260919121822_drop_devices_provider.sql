-- 0011 · drop what nothing uses: the devices table (server push is not planned for v1; a token
-- table comes back with its own migration when it is) and conversations.provider (the model id
-- already names the provider).

drop table if exists public.devices;
alter table public.conversations drop column if exists provider;
