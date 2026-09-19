// delete-account · deletes the calling user (auth admin), which cascades through every table.
// The store subscription is left alone: the app tells the user to cancel it in the store.
//
//   supabase functions serve --env-file supabase/.env.local
//   curl -X POST http://127.0.0.1:54321/functions/v1/delete-account -H "Authorization: Bearer <jwt>"

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { HttpError, json, serveWithUser } from '../_shared/http.ts';

serveWithUser(async ({ userId, db }) => {
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) throw new HttpError(500, 'delete_failed', error.message);
  return json({ deleted: true, userId });
});
