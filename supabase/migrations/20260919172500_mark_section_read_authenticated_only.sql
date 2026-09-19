-- 0019 · only signed-in users may advance a reading text
--
-- Migration 0018 revoked EXECUTE from `public` and granted it to `authenticated`, which reads as
-- enough but is not: Supabase's default privileges grant EXECUTE on every new function in `public`
-- to `anon` and `authenticated` directly, and revoking from the `public` pseudo-role leaves a
-- direct grant alone. So `mark_section_read` stayed callable from `/rest/v1/rpc` without signing in.
--
-- Nothing could be read or written through it — it filters on `auth.uid()`, which is null for an
-- anonymous caller, so the lookup matched no row and it raised "reading text not found" — but it
-- was surface nobody asked for, and the database linter is right to flag it.
--
-- Caught by Supabase's advisor after deploying, not by the local harness, which has no such
-- default privileges to reproduce.

revoke execute on function public.mark_section_read(uuid, int) from anon;
