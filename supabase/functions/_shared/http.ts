// Shared HTTP helpers for the edge functions: CORS, JSON responses, a typed error and the
// "authenticated user" wrapper every function starts from.

import { withSupabase } from 'npm:@supabase/server';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** An error the app can show: `code` is stable (the app maps it to copy), `status` the HTTP status. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

/** Runs a handler and turns thrown HttpErrors (and anything else) into JSON error responses. */
export async function handle(req: Request, fn: () => Promise<Response>): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  try {
    return await fn();
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.code, message: e.message }, e.status);
    console.error(e);
    return json({ error: 'internal', message: e instanceof Error ? e.message : String(e) }, 500);
  }
}

// deno-lint-ignore no-explicit-any
type AdminClient = any;

export interface UserContext<B> {
  userId: string;
  isAnonymous: boolean;
  /** Service-role client (SUPABASE_SECRET_KEYS); RLS does not apply. */
  db: AdminClient;
  body: B;
}

/**
 * `Deno.serve` for a POST function that needs the caller's user: validates the session JWT
 * (`@supabase/server`), parses the JSON body and maps errors to `{ error, message }`.
 */
export function serveWithUser<B>(fn: (ctx: UserContext<B>) => Promise<Response>): void {
  Deno.serve(
    withSupabase({ auth: 'user' }, (req, ctx) =>
      handle(req, async () => {
        const claims = ctx.userClaims as { id?: string; is_anonymous?: boolean } | null | undefined;
        if (!claims?.id) throw new HttpError(401, 'unauthenticated');
        const body = (await req.json().catch(() => ({}))) as B;
        return fn({
          userId: claims.id,
          isAnonymous: claims.is_anonymous === true,
          db: ctx.supabaseAdmin,
          body,
        });
      }),
    ),
  );
}
