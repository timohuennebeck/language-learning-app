// generate-reading · builds one Lesetext (docs/lesetext-plan.md §4).
//
// Body: { language?, topic?, textId? }  — `textId` retries an existing row.
// Returns: { textId } immediately; the work finishes in the background and the app polls the row.
//
// Three model calls. The writer produces the prose and a translation per sentence; the lemmatiser
// names each content word's dictionary form; between them and the annotator we look the words up,
// so the annotator only explains what the shared dictionary does not already know. Everything the
// last two claim is checked against the prose the writer actually wrote before the row goes
// `ready` — a wrong gloss is worse than no text, because the learner memorises it.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { HttpError, json, serveWithUser } from '../_shared/http.ts';
import {
  READING_HELPER_MODEL,
  READING_WRITER_MODEL,
  respondJsonWithUsage,
  type Usage,
} from '../_shared/openai.ts';
import { toLemma } from '../_shared/lemma.ts';
import { findCandidates, resolveLexeme, type Candidate, type Pos } from '../_shared/lexemes.ts';
import {
  ANNOTATOR_SCHEMA,
  LEMMATISER_SCHEMA,
  READING_PROMPT_VERSION,
  SECTION_COUNT,
  WRITER_SCHEMA,
  annotatorInstructions,
  lemmatiserInstructions,
  readingMinutes,
  wordTarget,
  writerInput,
  writerInstructions,
} from '../_shared/reading-prompt.ts';
import {
  assertUsable,
  buildDocument,
  InvalidText,
  type AnnotatorSpan,
  type WriterText,
} from '../_shared/reading-document.ts';

interface Body {
  language?: string;
  topic?: string;
  textId?: string;
}

/** A row still `generating` after this long lost its instance; the next call sweeps it. */
const STALE_SECONDS = 90;
/** Failed rows do not count against the daily cap, so retries need their own ceiling. */
const MAX_ATTEMPTS_PER_HOUR = 10;
/** Due words handed to the writer, and how many of them the text has to actually use. */
const DUE_WORDS = 20;

const STAGE = { queued: 0, writing: 1, explaining: 2, done: 3 } as const;

// deno-lint-ignore no-explicit-any
type Db = any;

/** Closes rows abandoned by a dead instance, so a learner is never stuck on the preparing screen. */
async function sweepStale(db: Db, userId: string): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_SECONDS * 1000).toISOString();
  await db
    .from('reading_texts')
    .update({ status: 'failed', error_code: 'timeout', error: 'generation did not finish' })
    .eq('user_id', userId)
    .eq('status', 'generating')
    .lt('created_at', cutoff);
}

async function assertWithinLimits(db: Db, userId: string): Promise<void> {
  const hourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  const { count: recent } = await db
    .from('reading_texts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', hourAgo);
  if ((recent ?? 0) >= MAX_ATTEMPTS_PER_HOUR) {
    throw new HttpError(429, 'TOO_MANY_ATTEMPTS', 'too many generations this hour');
  }

  const { data: config } = await db
    .from('app_config')
    .select('value')
    .eq('key', 'daily_generation_limit')
    .maybeSingle();
  const limit = Number((config?.value as { reading_texts?: number } | null)?.reading_texts ?? 2);
  if (!limit) return;

  // The learner's local day is not known until `profiles.timezone` lands with the activity
  // migration; until then the cap resets at UTC midnight, an hour or two off for European users.
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const { count } = await db
    .from('reading_texts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('status', 'failed')
    .gte('created_at', since.toISOString());
  if ((count ?? 0) >= limit) {
    throw new HttpError(429, 'GENERATION_LIMIT', `${limit} texts a day`);
  }
}

interface Context {
  language: string;
  nativeLanguage: string;
  level: string;
  goal: string | null;
  topic: string | null;
  dueLemmas: string[];
  recentWords: string[];
  lastConversationTopic: string | null;
  lastConversationId: string | null;
  recentTitles: string[];
}

/** Everything the writer is told about this learner. The app sends ids, never prompt text. */
async function gatherContext(
  db: Db,
  userId: string,
  language: string,
  topic: string | null,
): Promise<Context> {
  const { data: profile } = await db
    .from('profiles')
    .select('app_language, active_language')
    .eq('id', userId)
    .maybeSingle();
  if (!profile) throw new HttpError(404, 'profile_missing');
  const learning = language || profile.active_language;
  if (!learning) throw new HttpError(400, 'bad_request', 'no language to practise');

  const { data: learner } = await db
    .from('learner_languages')
    .select('level, goal')
    .eq('user_id', userId)
    .eq('language', learning)
    .maybeSingle();

  const { data: due } = await db
    .from('flashcards')
    .select('lexemes(lemma)')
    .eq('user_id', userId)
    .eq('language', learning)
    .lte('due', new Date().toISOString().slice(0, 10))
    .order('box')
    .limit(DUE_WORDS);

  const { data: conversation } = await db
    .from('conversations')
    .select('id, topic, review')
    .eq('user_id', userId)
    .eq('language', learning)
    .eq('status', 'ended')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: recent } = await db
    .from('reading_texts')
    .select('title')
    .eq('user_id', userId)
    .eq('language', learning)
    .eq('status', 'ready')
    .order('created_at', { ascending: false })
    .limit(5);

  const review = conversation?.review as { words?: { front?: string }[] } | null;
  return {
    language: learning,
    nativeLanguage: profile.app_language,
    level: learner?.level ?? 'A1',
    goal: learner?.goal ?? null,
    topic,
    dueLemmas: (due ?? [])
      .map((r: { lexemes?: { lemma?: string } }) => r.lexemes?.lemma)
      .filter((l: string | undefined): l is string => !!l),
    recentWords: (review?.words ?? [])
      .map((w) => w.front ?? '')
      .filter(Boolean)
      .slice(0, 10),
    lastConversationTopic: conversation?.topic ?? null,
    lastConversationId: conversation?.id ?? null,
    recentTitles: (recent ?? [])
      .map((r: { title: string | null }) => r.title ?? '')
      .filter(Boolean),
  };
}

interface LemmatisedWord {
  surface: string;
  lemma: string;
  pos: Pos;
}

/** Runs the three calls and stores the result. Errors land on the row, never on the caller. */
async function generate(db: Db, textId: string, ctx: Context, draft: WriterText | null) {
  const usage: Usage[] = [];
  const target = wordTarget(ctx.level);
  let complaint: string | null = null;
  // Survives the retry: prose that was fine is annotated again rather than rewritten.
  let text: WriterText | null = draft;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      // 1 · the prose, unless a previous run already produced some worth keeping.
      if (!text) {
        await db.from('reading_texts').update({ stage: STAGE.writing }).eq('id', textId);
        const written = await respondJsonWithUsage<WriterText>(
          writerInstructions({ ...ctx, dueWords: ctx.dueLemmas, complaint }),
          writerInput({ ...ctx, dueWords: ctx.dueLemmas, complaint }),
          'reading_text',
          WRITER_SCHEMA,
          { model: READING_WRITER_MODEL, effort: 'medium', maxOutputTokens: 4000 },
        );
        usage.push(written.usage);
        text = written.value;
        await db
          .from('reading_texts')
          .update({ draft: text, title: text.title?.trim() || null, stage: STAGE.explaining })
          .eq('id', textId);
      } else {
        await db.from('reading_texts').update({ stage: STAGE.explaining }).eq('id', textId);
      }

      // Sentence ids are positional and are what the next two calls refer to.
      const sentences: { id: string; source: string; native: string }[] = [];
      text.sections.forEach((section) =>
        section.sentences.forEach((s) =>
          sentences.push({ id: `s${sentences.length + 1}`, source: s.source, native: s.native }),
        ),
      );

      // 2 · which words are worth a gloss, and what their dictionary form is.
      const lemmatised = await respondJsonWithUsage<{
        sentences: { id: string; words: LemmatisedWord[] }[];
      }>(
        lemmatiserInstructions(ctx.language),
        sentences.map((s) => `${s.id}: ${s.source}`).join('\n'),
        'reading_lemmas',
        LEMMATISER_SCHEMA,
        { model: READING_HELPER_MODEL, effort: 'low', maxOutputTokens: 3000 },
      );
      usage.push(lemmatised.usage);

      // Each word gets a key the annotator answers by. Asking it to echo the sentence id and the
      // surface back instead cost a whole generation: the model returned the sentence's text where
      // an id was wanted, nothing matched, and every span was silently dropped.
      const wordsBySentence = new Map<string, LemmatisedWord[]>();
      const wordByKey = new Map<string, { word: LemmatisedWord; sentenceId: string }>();
      for (const s of lemmatised.value.sentences) {
        const words = s.words ?? [];
        wordsBySentence.set(s.id, words);
        words.forEach((word, i) => wordByKey.set(`${s.id}w${i + 1}`, { word, sentenceId: s.id }));
      }
      const allWords = [...wordsBySentence.values()].flat();

      // 3 · what the dictionary already knows, so the annotator only writes what is new.
      const candidates = await findCandidates(db, ctx.language, ctx.nativeLanguage, allWords);

      const annotatorLines = sentences.flatMap((s) => {
        const words = wordsBySentence.get(s.id) ?? [];
        if (!words.length) return [];
        return [
          `${s.id} · ${ctx.language}: ${s.source}`,
          `${s.id} · ${ctx.nativeLanguage}: ${s.native}`,
          ...words.map((w, i) => {
            const known = candidates.get(toLemma(w.lemma, ctx.language)) ?? [];
            const offered = known
              .filter((c: Candidate) => c.trans)
              .map((c: Candidate) => `${c.id} = "${c.trans}" (${c.pos})`)
              .join('; ');
            return `  [${s.id}w${i + 1}] "${w.surface}" (${w.lemma}, ${w.pos})${offered ? ` · known meanings: ${offered}` : ''}`;
          }),
          '',
        ];
      });

      const annotated = await respondJsonWithUsage<{ spans: AnnotatorSpan[] }>(
        annotatorInstructions(ctx.language, ctx.nativeLanguage),
        [
          `Mark about ${Math.min(7, Math.max(3, Math.round(sentences.length * 0.6)))} of the most useful words per section with "mark": true; the rest false.`,
          '',
          ...annotatorLines,
        ].join('\n'),
        'reading_glosses',
        ANNOTATOR_SCHEMA,
        { model: READING_HELPER_MODEL, effort: 'low', maxOutputTokens: 8000 },
      );
      usage.push(annotated.usage);

      // Resolve every annotated span to a dictionary entry, creating what is genuinely new.
      const spansBySentence = new Map<string, AnnotatorSpan[]>();
      const lexemeBySpan = new Map<string, string>();
      const unmatched: string[] = [];
      for (const span of annotated.value.spans ?? []) {
        const hit = wordByKey.get(span.word);
        if (!hit) {
          // Not a key we offered. Never silent: a run where every key is wrong looks exactly like
          // a text with nothing worth explaining, and that cost a whole generation to work out.
          unmatched.push(span.word);
          continue;
        }
        const { word, sentenceId } = hit;
        const list = spansBySentence.get(sentenceId) ?? [];
        // The surface comes from the lemmatiser, which copied it out of the sentence, so the
        // offsets are computed against text that is really there whatever the annotator echoed.
        list.push({ ...span, surface: word.surface });
        spansBySentence.set(sentenceId, list);
        const id = await resolveLexeme(
          db,
          ctx.language,
          ctx.nativeLanguage,
          { lemma: word.lemma, pos: word.pos, lexeme: span.lexeme, gloss: span.gloss },
          candidates,
        );
        if (id) lexemeBySpan.set(`${sentenceId}\u0000${word.surface}`, id);
      }
      if (unmatched.length) {
        console.warn(
          `${textId}: ${unmatched.length}/${(annotated.value.spans ?? []).length} spans used a key that was never offered, e.g. ${JSON.stringify(unmatched.slice(0, 3))}`,
        );
      }

      const result = buildDocument(
        text,
        spansBySentence,
        (sentenceId, surface) => lexemeBySpan.get(`${sentenceId}\u0000${surface}`) ?? null,
      );
      result.dropped.push(...unmatched.map((k) => `annotator used unknown key "${k}"`));

      // Did the text actually bring the learner's due words back? Every lemma the lemmatiser
      // found is a word the text contains, whether or not it ended up with a tappable span.
      const inText = new Set(allWords.map((w) => toLemma(w.lemma, ctx.language)));
      const dueHit = ctx.dueLemmas.filter((l) => inText.has(toLemma(l, ctx.language))).length;

      assertUsable(result, {
        sections: SECTION_COUNT,
        words: target,
        dueLemmas: ctx.dueLemmas.length,
        dueHit,
      });

      if (result.dropped.length) console.warn(`${textId} dropped:`, result.dropped.slice(0, 10));

      await db
        .from('reading_texts')
        .update({
          status: 'ready',
          stage: STAGE.done,
          title: result.document.title,
          content: result.document,
          lexeme_ids: result.lexemeIds,
          section_count: result.document.sections.length,
          word_count: result.wordCount,
          minutes: readingMinutes(result.wordCount),
          source_conversation_id: ctx.lastConversationId,
          writer_model: READING_WRITER_MODEL,
          annotator_model: READING_HELPER_MODEL,
          prompt_version: READING_PROMPT_VERSION,
          usage: { calls: usage, dropped: result.dropped },
          error_code: null,
          error: null,
          ready_at: new Date().toISOString(),
        })
        .eq('id', textId);
      return;
    } catch (e) {
      // A text that failed our own checks is worth one more go with the complaint attached; a
      // provider error is not, because the same call will fail the same way.
      if (e instanceof InvalidText && attempt === 0) {
        complaint = e.message;
        // Only throw the prose away when the prose is what was wrong.
        if (e.blames === 'writer') text = null;
        console.warn(
          `${textId} rejected, retrying the ${e.blames === 'writer' ? 'whole text' : 'annotation'}: ${e.message}`,
        );
        continue;
      }
      const invalid = e instanceof InvalidText;
      console.error(`${textId} failed`, e);
      await db
        .from('reading_texts')
        .update({
          status: 'failed',
          error_code: invalid ? 'invalid_content' : 'provider',
          error: e instanceof Error ? e.message : String(e),
          usage: { calls: usage },
        })
        .eq('id', textId);
      return;
    }
  }
}

serveWithUser<Body>(async ({ userId, db, body }) => {
  await sweepStale(db, userId);

  // A retry re-runs the row the learner is already looking at, so the error screen's button does
  // not spend another day's allowance.
  if (body.textId) {
    const { data: row } = await db
      .from('reading_texts')
      .select('id, language, native_language, level, topic, draft, attempts, status')
      .eq('id', body.textId)
      .eq('user_id', userId)
      .maybeSingle();
    if (!row) throw new HttpError(404, 'text_missing');
    if (row.status === 'ready') return json({ textId: row.id });

    await assertWithinLimits(db, userId);
    const ctx = await gatherContext(db, userId, row.language, row.topic);
    await db
      .from('reading_texts')
      .update({
        status: 'generating',
        stage: STAGE.queued,
        attempts: (row.attempts ?? 0) + 1,
        error_code: null,
        error: null,
        created_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    EdgeRuntime.waitUntil(generate(db, row.id, ctx, (row.draft as WriterText | null) ?? null));
    return json({ textId: row.id });
  }

  await assertWithinLimits(db, userId);
  const ctx = await gatherContext(db, userId, body.language ?? '', body.topic?.trim() || null);

  const { data: created, error } = await db
    .from('reading_texts')
    .insert({
      user_id: userId,
      language: ctx.language,
      native_language: ctx.nativeLanguage,
      level: ctx.level,
      topic: ctx.topic,
      status: 'generating',
      stage: STAGE.queued,
      attempts: 1,
      prompt_version: READING_PROMPT_VERSION,
    })
    .select('id')
    .single();
  // The partial unique index refuses a second `generating` row: two taps on the card are one text.
  if (error) {
    const { data: running } = await db
      .from('reading_texts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'generating')
      .maybeSingle();
    if (running) return json({ textId: running.id });
    throw new HttpError(500, 'insert_failed', error.message);
  }

  EdgeRuntime.waitUntil(generate(db, created.id, ctx, null));
  return json({ textId: created.id });
});
