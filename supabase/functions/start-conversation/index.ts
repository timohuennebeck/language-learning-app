// start-conversation · opens a live call on the OpenAI Live API (GPT-Live-1): checks the
// placement limits, inserts the `conversations` row, creates the Live session from the app's
// WebRTC offer and returns the SDP answer.
//
// Body: { kind: 'placement' | 'free' | 'scenario', sdp: string, scenarioSlug?: string, deviceId?: string }
// Returns: { conversationId, sessionId, sdp, model, maxSeconds, title, brief, tasks }
//
// docs/database-plan.md §3.6 describes the flow and the placement limits.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { HttpError, json, serveWithUser } from '../_shared/http.ts';
import { createLiveSession } from '../_shared/openai.ts';
import {
  buildBackendInstructions,
  buildInstructions,
  openingMessage,
  PROMPT_VERSION,
  taskTool,
  type Kind,
  type ScenarioTask,
} from '../_shared/prompt.ts';

interface Body {
  kind?: Kind;
  sdp?: string;
  scenarioSlug?: string;
  deviceId?: string;
}

const PLACEMENTS_PER_DEVICE = 3;
const PLACEMENT_WINDOW_DAYS = 30;
const GRACE_SECONDS = 5 * 60;

serveWithUser<Body>(async ({ userId, isAnonymous, db, body }) => {
  const kind = body.kind;
  if (kind !== 'placement' && kind !== 'free' && kind !== 'scenario') {
    throw new HttpError(400, 'bad_request', 'kind must be placement, free or scenario');
  }
  if (!body.sdp) throw new HttpError(400, 'bad_request', 'sdp (WebRTC offer) missing');
  const deviceId = body.deviceId ?? null;

  const { data: profile } = await db
    .from('profiles')
    .select('first_name, app_language, active_language')
    .eq('id', userId)
    .maybeSingle();
  if (!profile) throw new HttpError(404, 'profile_missing');
  const language = profile.active_language as string | null;
  if (!language) throw new HttpError(409, 'language_missing', 'No learning language chosen yet');

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
  const cfg = Object.fromEntries(
    (config ?? []).map((r: { key: string; value: unknown }) => [r.key, Number(r.value)]),
  );
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
      // Only calls that happened count; a denied microphone or a failed connection is free.
      const since = new Date(Date.now() - PLACEMENT_WINDOW_DAYS * 86_400_000).toISOString();
      const { count } = await db
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('kind', 'placement')
        .eq('device_id', deviceId)
        .neq('status', 'failed')
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
    q = kind === 'placement' ? q.eq('is_placement', true) : q.eq('slug', body.scenarioSlug ?? '');
    const { data } = await q.maybeSingle();
    if (!data) throw new HttpError(404, 'scenario_missing');
    scenario = {
      ...data,
      brief: (data.brief ?? {}) as Record<string, string>,
      tasks: (data.tasks ?? []) as ScenarioTask[],
    };
  }
  const tasks = scenario?.tasks ?? [];
  const level = learner?.level ?? 'A2';

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
      provider: 'openai',
      prompt_version: PROMPT_VERSION,
      device_id: deviceId,
      max_seconds: maxSeconds,
    })
    .select('id')
    .single();
  if (insertError || !row) throw new HttpError(500, 'insert_failed', insertError?.message);

  let session;
  try {
    session = await createLiveSession({
      sdp: body.sdp,
      instructions: buildInstructions({
        kind,
        firstName: profile.first_name ?? '',
        learningLanguage: language,
        nativeLanguage: profile.app_language,
        level,
        goal: learner?.goal ?? null,
        maxSeconds,
        scenario: scenario
          ? { title: scenario.title, pipPrompt: scenario.pip_prompt, tasks }
          : null,
      }),
      backendInstructions: buildBackendInstructions(tasks),
      tools: tasks.length ? [taskTool(tasks)] : [],
      opening: openingMessage(profile.first_name ?? '', language),
    });
  } catch (e) {
    await db
      .from('conversations')
      .update({
        status: 'failed',
        end_reason: 'error',
        ended_at: new Date().toISOString(),
        duration_seconds: 0,
      })
      .eq('id', row.id);
    throw e;
  }
  await db
    .from('conversations')
    .update({ model: session.model, provider_session_id: session.sessionId })
    .eq('id', row.id);

  return json({
    conversationId: row.id,
    sessionId: session.sessionId,
    sdp: session.sdp,
    model: session.model,
    maxSeconds,
    title: scenario?.title ?? null,
    brief: scenario?.brief ?? {},
    tasks,
  });
});
