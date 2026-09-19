// delete-account · deletes the calling user (auth admin), which cascades through every table.
// The store subscription is left alone: the app tells the user to cancel it in the store.
//
//   supabase functions serve --env-file supabase/.env.local
//   curl -X POST http://127.0.0.1:54321/functions/v1/delete-account -H "Authorization: Bearer <jwt>"

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anonKey || !serviceKey) return json({ error: 'Function is not configured' }, 500);

  // Who is calling? Resolve the user from the caller's own JWT, never from the request body.
  const authorization = req.headers.get('Authorization') ?? '';
  const asUser = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data, error: userError } = await asUser.auth.getUser();
  if (userError || !data.user) return json({ error: 'Not authenticated' }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await admin.auth.admin.deleteUser(data.user.id);
  if (error) return json({ error: error.message }, 500);

  return json({ deleted: true, userId: data.user.id });
});
