// start-conversation · opens a live call: checks the placement limits, inserts the
// `conversations` row and mints the ephemeral OpenAI client secret the app connects with.
//
// Body: { kind: 'placement' | 'free' | 'scenario', scenarioSlug?: string, deviceId?: string }
// Returns: { conversationId, clientSecret, expiresAt, model, maxSeconds, title, brief, tasks }
//
// docs/database-plan.md §3.6 describes the flow and the placement limits.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from 'npm:@supabase/server';

import { handle, HttpError, json } from '../_shared/http.ts';
import { createClientSecret } from '../_shared/openai.ts';
import {
  buildInstructions,
  PROMPT_VERSION,
  taskTool,
  type ScenarioTask,
} from '../_shared/prompt.ts';

type Kind = 'placement' | 'free' | 'scenario';

interface Body {
  kind?: Kind;
  scenarioSlug?: string;
  deviceId?: string;
}

const PLACEMENTS_PER_DEVICE = 3;
const PLACEMENT_WINDOW_DAYS = 30;
const SECRET_TTL_SECONDS = 300;
const GRACE_SECONDS = 5 * 60;

Deno.serve(
  withSupabase({ auth: 'user' }, (req, ctx) =>
    handle(req, async () => {
      const userId = ctx.userClaims?.id;
      if (!userId) throw new HttpError(401, 'unauthenticated');
      const isAnonymous = ctx.userClaims?.is_anonymous === true;
      const db = ctx.supabaseAdmin;

      const body = (await req.json().catch(() => ({}))) as Body;
      const kind = body.kind;
      if (kind !== 'placement' && kind !== 'free' && kind !== 'scenario') {
        throw new HttpError(400, 'bad_request', 'kind must be placement, free or scenario');
      }
      const deviceId = body.deviceId ?? req.headers.get('x-device-id') ?? null;

      const { data: profile, error: profileError } = await db
        .from('profiles')
        .select('first_name, app_language, active_language')
        .eq('id', userId)
        .single();
      if (profileError || !profile) throw new HttpError(404, 'profile_missing');
      const language = profile.active_language as string;

      const { data: learner } = await db
        .from('learner_languages')
        .select('level, goal, placement_conversation_id')
        .eq('user_id', userId)
        .eq('language', language)
        .maybeSingle();

      const { data: config } = await db
        .from('app_config')
        .select('key, value')
        .in('key', ['conversation_max_seconds', 'placement_max_seconds']);
      const cfg = Object.fromEntries((config ?? []).map((r) => [r.key, Number(r.value)]));
      const maxSeconds =
        kind === 'placement'
          ? (cfg.placement_max_seconds ?? 120)
          : (cfg.conversation_max_seconds ?? 360);

      // Calls the app never ended (crash, lost connection) count as used once their time is up.
      const staleBefore = new Date(Date.now() - (maxSeconds + GRACE_SECONDS) * 1000).toISOString();
      await db
        .from('conversations')
        .update({ status: 'ended', end_reason: 'abandoned', ended_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('status', 'active')
        .lt('started_at', staleBefore);

      if (kind === 'placement') {
        if (learner?.placement_conversation_id) throw new HttpError(409, 'placement_used');
        if (isAnonymous) {
          const { count } = await db
            .from('learner_languages')
            .select('language', { count: 'exact', head: true })
            .eq('user_id', userId)
            .not('placement_conversation_id', 'is', null);
          if ((count ?? 0) > 0) throw new HttpError(403, 'account_required');
        }
        if (deviceId) {
          const since = new Date(Date.now() - PLACEMENT_WINDOW_DAYS * 86_400_000).toISOString();
          const { count } = await db
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .eq('kind', 'placement')
            .eq('device_id', deviceId)
            .gte('started_at', since);
          if ((count ?? 0) >= PLACEMENTS_PER_DEVICE) throw new HttpError(429, 'placement_limit');
        }
      }

      let scenario: {
        id: string;
        title: string;
        brief: Record<string, string>;
        pip_prompt: string;
        tasks: ScenarioTask[];
      } | null = null;
      if (kind !== 'free') {
        let q = db
          .from('scenarios')
          .select('id, title, brief, pip_prompt, tasks')
          .eq('language', language)
          .eq('active', true);
        q =
          kind === 'placement' ? q.eq('is_placement', true) : q.eq('slug', body.scenarioSlug ?? '');
        const { data } = await q.maybeSingle();
        if (!data) throw new HttpError(404, 'scenario_missing');
        scenario = {
          ...data,
          brief: (data.brief ?? {}) as Record<string, string>,
          tasks: (data.tasks ?? []) as ScenarioTask[],
        };
      }

      const level = learner?.level ?? 'A2';
      const instructions = buildInstructions({
        kind,
        firstName: profile.first_name ?? '',
        learningLanguage: language,
        nativeLanguage: profile.app_language,
        level,
        goal: learner?.goal ?? null,
        maxSeconds,
        scenario: scenario
          ? { title: scenario.title, pipPrompt: scenario.pip_prompt, tasks: scenario.tasks }
          : null,
      });
      const tools = scenario?.tasks.length ? [taskTool(scenario.tasks)] : [];

      const secret = await createClientSecret({
        instructions,
        language,
        tools,
        expiresInSeconds: SECRET_TTL_SECONDS,
      });

      const { data: row, error: insertError } = await db
        .from('conversations')
        .insert({
          user_id: userId,
          language,
          native_language: profile.app_language,
          kind,
          scenario_id: scenario?.id ?? null,
          topic: scenario?.title ?? null,
          level,
          model: secret.model,
          prompt_version: PROMPT_VERSION,
          device_id: deviceId,
          max_seconds: maxSeconds,
        })
        .select('id')
        .single();
      if (insertError || !row) throw new HttpError(500, 'insert_failed', insertError?.message);

      return json({
        conversationId: row.id,
        clientSecret: secret.value,
        expiresAt: secret.expiresAt,
        model: secret.model,
        maxSeconds,
        title: scenario?.title ?? null,
        brief: scenario?.brief ?? {},
        tasks: scenario?.tasks ?? [],
      });
    }),
  ),
);
