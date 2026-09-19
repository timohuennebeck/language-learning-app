// Pip's prompts for the Live call. Bump PROMPT_VERSION whenever the wording changes; it is
// stored on `conversations.prompt_version` so reviews can be compared across versions.
//
// The Live API splits the prompt in two: frontend instructions for the voice model (how to talk,
// when to delegate) and a backend prompt for the Responses model that handles delegated tasks.

import type { FunctionTool } from './openai.ts';

export const PROMPT_VERSION = '2026-09-19.4';

export type Kind = 'placement' | 'free' | 'scenario';

const LANGUAGE_NAMES: Record<string, string> = {
  de: 'German',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  pt: 'Portuguese',
};

export const languageName = (code: string) => LANGUAGE_NAMES[code] ?? code;

export interface ScenarioTask {
  id: string;
  /** Task text per app locale. */
  text: Record<string, string>;
  /** Example sentence in the learning language. */
  hint?: string;
}

/** The task text the models see (English, else whatever locale exists). */
export const taskLabel = (t: ScenarioTask) => t.text.en ?? Object.values(t.text)[0] ?? t.id;

export interface PromptInput {
  kind: Kind;
  firstName: string;
  learningLanguage: string;
  nativeLanguage: string;
  level: string;
  goal: string | null;
  maxSeconds: number;
  scenario: { title: string; pipPrompt: string; tasks: ScenarioTask[] } | null;
}

const LEVEL_GUIDE: Record<string, string> = {
  A1: 'very short sentences, present tense, everyday words, speak slowly',
  A2: 'short sentences, simple past and future, familiar topics',
  B1: 'natural pace, connected sentences, ask follow-up questions',
  B2: 'natural pace, idioms allowed, nuanced questions and opinions',
};

/** Frontend instructions for the Live model. */
export function buildInstructions(p: PromptInput): string {
  const learning = languageName(p.learningLanguage);
  const native = languageName(p.nativeLanguage);
  const minutes = Math.round(p.maxSeconds / 60);
  const lines = [
    `You are Pip, a warm and playful penguin who helps ${p.firstName || 'the learner'} practise speaking ${learning}.`,
    `Always speak ${learning}. Never switch to ${native} unless the learner is clearly stuck; then give at most one short hint in ${native} and continue in ${learning}.`,
    `The learner's level is ${p.level}: ${LEVEL_GUIDE[p.level] ?? LEVEL_GUIDE.A2}.`,
    'Keep every turn short (one or two sentences) and end most turns with a question so the learner talks more than you.',
    'Do not correct mistakes during the conversation. Accept mixed-language answers. Be encouraging without being cheesy.',
    'If the learner interrupts, stop and listen.',
    `The call lasts about ${minutes} minutes. You speak first: open with a short greeting in ${learning}.`,
  ];
  if (p.goal) lines.push(`The learner is learning ${learning} for: ${p.goal}.`);
  if (p.scenario) {
    lines.push('', `Scenario "${p.scenario.title}": ${p.scenario.pipPrompt}`);
    if (p.scenario.tasks.length) {
      lines.push(
        '',
        'The learner is trying to complete these tasks (ids in brackets). Steer the conversation so each can happen naturally:',
        ...p.scenario.tasks.map(
          (t) => `- [${t.id}] ${taskLabel(t)}${t.hint ? ` (e.g. "${t.hint}")` : ''}`,
        ),
        'Recording a task is the ONLY thing you ever delegate. The moment the learner has done one, delegate immediately with exactly "task done: <id>", using the id in brackets and nothing else. One delegation per task, never twice for the same id, and never wait for the end of the call.',
        'Delegating is silent bookkeeping: keep speaking to the learner as if nothing happened, never read the id out and never tell them a task was ticked off.',
        'Never delegate anything else. The greeting, every reply and every question are spoken by you; handing one of those to the backend leaves the learner in silence.',
      );
    }
  }
  if (p.kind === 'placement') {
    lines.push(
      '',
      'This conversation is a placement talk: probe the level gently by raising the difficulty step by step (present → past → future → hypotheticals) while staying inside the scenario. Do not announce a level.',
    );
  }
  if (p.kind === 'free') {
    lines.push(
      '',
      'Free conversation: ask what the learner would like to talk about, or suggest a light everyday topic.',
    );
  }
  return lines.join('\n');
}

/**
 * Backend prompt for the Responses model the Live session delegates to. Only a talk with tasks
 * gets a backend at all (see `createLiveSession`), so the task-less string is just a safe
 * default for a session that should never delegate.
 */
export function buildBackendInstructions(tasks: ScenarioTask[]): string {
  if (!tasks.length)
    return 'You support a spoken language-practice conversation. Answer in one short sentence.';
  return [
    'You record progress in a spoken language-practice conversation. The voice model sends you a message of the form "task done: <id>" when the learner has completed one of the tasks below.',
    `Tasks: ${tasks.map((t) => `${t.id} = ${taskLabel(t)}`).join('; ')}.`,
    'Call mark_task_done with that id straight away. Do not deliberate and do not ask for confirmation: the voice model has already decided. If the id is not an exact match, pick the task it describes.',
    'After the call, reply with the single word "recorded". Never write anything the learner should hear.',
  ].join('\n');
}

/** The one tool the backend has during a scenario call. */
export function taskTool(tasks: ScenarioTask[]): FunctionTool {
  return {
    type: 'function',
    name: 'mark_task_done',
    description: 'Record that the learner has completed one of the conversation tasks.',
    parameters: {
      type: 'object',
      properties: { task_id: { type: 'string', enum: tasks.map((t) => t.id) } },
      required: ['task_id'],
      additionalProperties: false,
    },
    strict: true,
  };
}

/**
 * The developer message that opens the session (initial history). The app asks for the first
 * response as soon as the session starts; this says what that response is. It is worded as
 * something to say out loud, because "greet them and start the conversation" read like a job to
 * hand to the backend and got delegated instead of spoken.
 */
export function openingMessage(firstName: string, learningLanguage: string): string {
  const who = firstName || 'The learner';
  return `${who} has just joined the call and is waiting for you to speak. Say a short greeting in ${languageName(learningLanguage)} out loud now, then ask your first question. Do not delegate this.`;
}
