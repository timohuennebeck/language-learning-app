// delete-account · deletes the calling user (auth admin), which cascades through every table.
// The store subscription is left alone: the app tells the user to cancel it in the store.
//
// Uses @supabase/server: `auth: 'user'` validates the caller's session JWT and hands over an
// admin client backed by the project's secret key (SUPABASE_SECRET_KEYS, provisioned by Supabase).
//
//   supabase functions serve --env-file supabase/.env.local
//   curl -X POST http://127.0.0.1:54321/functions/v1/delete-account -H "Authorization: Bearer <jwt>"

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from 'npm:@supabase/server';

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

Deno.serve(
  withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const userId = ctx.userClaims?.id;
    if (!userId) return json({ error: 'Not authenticated' }, 401);

    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) return json({ error: error.message }, 500);

    return json({ deleted: true, userId });
  }),
);
