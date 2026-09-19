// end-conversation · closes a live call: stores the transcript and usage, asks a text model for
// the review (tasks done with what was said, a short summary, words worth saving; for placement
// calls also the CEFR level) and, for placement, writes the level to `learner_languages`.
//
// Body: { conversationId, endReason: 'user' | 'max_duration' | 'error', durationSeconds,
//         transcript: [{ role: 'user' | 'assistant', text }], tasksDone: string[], usage?: object }
// Returns: { status: 'ended' | 'failed', review, level }

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from 'npm:@supabase/server';

import { handle, HttpError, json } from '../_shared/http.ts';
import { respondJson } from '../_shared/openai.ts';
import { languageName, type ScenarioTask } from '../_shared/prompt.ts';

interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

interface Body {
  conversationId?: string;
  endReason?: 'user' | 'max_duration' | 'error';
  durationSeconds?: number;
  transcript?: Turn[];
  tasksDone?: string[];
  usage?: Record<string, unknown>;
}

interface Review {
  summary: string;
  tasks: { id: string; done: boolean; said: string | null }[];
  level: 'A1' | 'A2' | 'B1' | 'B2' | null;
  evidence: string[];
  words: { front: string; back: string; example: string | null }[];
}

/** Calls shorter than this are counted as failed (nothing to review, no quota used). */
const MIN_SECONDS = 30;

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          done: { type: 'boolean' },
          said: { type: ['string', 'null'] },
        },
        required: ['id', 'done', 'said'],
        additionalProperties: false,
      },
    },
    level: { type: ['string', 'null'], enum: ['A1', 'A2', 'B1', 'B2', null] },
    evidence: { type: 'array', items: { type: 'string' } },
    words: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          front: { type: 'string' },
          back: { type: 'string' },
          example: { type: ['string', 'null'] },
        },
        required: ['front', 'back', 'example'],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'tasks', 'level', 'evidence', 'words'],
  additionalProperties: false,
};

function reviewInstructions(
  learning: string,
  native: string,
  placement: boolean,
  tasks: ScenarioTask[],
) {
  const lines = [
    `You review a short spoken ${learning} practice conversation between a learner and Pip (the assistant). Judge only the learner's turns.`,
    `Write "summary" in ${native}: two friendly sentences about what went well and one thing to work on.`,
    tasks.length
      ? `For each task id, decide whether the learner completed it and quote the learner's sentence that did it in "said" (verbatim, in ${learning}); null if not done.`
      : 'The "tasks" array is empty for this conversation.',
    `"words": up to 8 useful ${learning} words or short phrases from the learner's or Pip's turns worth saving as flashcards, with "back" in ${native} and a short example in ${learning} (or null).`,
    placement
      ? `"level": the learner's CEFR speaking level, one of A1, A2, B1, B2, and "evidence": 2–3 short observations in ${native} that justify it.`
      : '"level" must be null and "evidence" an empty array.',
  ];
  return lines.join('\n');
}

Deno.serve(
  withSupabase({ auth: 'user' }, (req, ctx) =>
    handle(req, async () => {
      const userId = ctx.userClaims?.id;
      if (!userId) throw new HttpError(401, 'unauthenticated');
      const db = ctx.supabaseAdmin;

      const body = (await req.json().catch(() => ({}))) as Body;
      if (!body.conversationId) throw new HttpError(400, 'bad_request', 'conversationId missing');
      const endReason = body.endReason ?? 'user';
      const duration = Math.max(0, Math.round(body.durationSeconds ?? 0));
      const transcript = (body.transcript ?? []).filter(
        (t) => t && typeof t.text === 'string' && t.text.trim(),
      );
      const tasksDone = new Set(body.tasksDone ?? []);

      const { data: conv } = await db
        .from('conversations')
        .select('id, kind, language, native_language, status, scenario_id, scenarios(tasks)')
        .eq('id', body.conversationId)
        .eq('user_id', userId)
        .maybeSingle();
      if (!conv) throw new HttpError(404, 'conversation_missing');
      if (conv.status !== 'active') throw new HttpError(409, 'conversation_closed');

      const endedAt = new Date().toISOString();
      const failed =
        endReason === 'error' ||
        duration < MIN_SECONDS ||
        !transcript.some((t) => t.role === 'user');
      if (failed) {
        await db
          .from('conversations')
          .update({
            status: 'failed',
            end_reason: endReason,
            ended_at: endedAt,
            duration_seconds: duration,
            transcript,
            usage: body.usage ?? null,
          })
          .eq('id', conv.id);
        return json({ status: 'failed', review: null, level: null });
      }

      const scenarioTasks = ((conv.scenarios as { tasks?: ScenarioTask[] } | null)?.tasks ??
        []) as ScenarioTask[];
      const placement = conv.kind === 'placement';
      const learning = languageName(conv.language);
      const native = languageName(conv.native_language);
      const input = [
        scenarioTasks.length
          ? `Tasks:\n${scenarioTasks.map((t) => `- ${t.id}: ${t.text.en ?? Object.values(t.text)[0]}`).join('\n')}\nThe app already marked these as done during the call: ${[...tasksDone].join(', ') || 'none'}.`
          : 'Tasks: none.',
        '',
        'Transcript:',
        ...transcript.map((t) => `${t.role === 'user' ? 'Learner' : 'Pip'}: ${t.text}`),
      ].join('\n');

      const review = await respondJson<Review>(
        reviewInstructions(learning, native, placement, scenarioTasks),
        input,
        'conversation_review',
        REVIEW_SCHEMA,
      );
      // The model's verdict wins, but a task Pip ticked during the call stays ticked.
      review.tasks = scenarioTasks.map((t) => {
        const r = review.tasks.find((x) => x.id === t.id);
        return { id: t.id, done: Boolean(r?.done) || tasksDone.has(t.id), said: r?.said ?? null };
      });
      const level = placement ? review.level : null;

      const { error: updateError } = await db
        .from('conversations')
        .update({
          status: 'ended',
          end_reason: endReason,
          ended_at: endedAt,
          duration_seconds: duration,
          transcript,
          review,
          usage: body.usage ?? null,
        })
        .eq('id', conv.id);
      if (updateError) throw new HttpError(500, 'update_failed', updateError.message);

      if (placement && level) {
        const { error } = await db
          .from('learner_languages')
          .update({
            level,
            level_source: 'placement',
            level_assessed_at: endedAt,
            placement_conversation_id: conv.id,
          })
          .eq('user_id', userId)
          .eq('language', conv.language);
        if (error) throw new HttpError(500, 'update_failed', error.message);
      }

      return json({ status: 'ended', review, level });
    }),
  ),
);
