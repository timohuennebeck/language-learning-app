// Pip's prompts for the Live call. Bump PROMPT_VERSION whenever the wording changes; it is
// stored on `conversations.prompt_version` so reviews can be compared across versions.
//
// The Live API splits the prompt in two: frontend instructions for the voice model (how to talk,
// when to delegate) and a backend prompt for the Responses model that handles delegated tasks.

import type { FunctionTool } from './openai.ts';

export const PROMPT_VERSION = '2026-09-19.2';

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
        'The moment the learner has done one of them, delegate to the backend with the message "task done: <id>" so it gets recorded, and keep talking without mentioning it.',
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

/** Backend prompt for the Responses model the Live session delegates to. */
export function buildBackendInstructions(tasks: ScenarioTask[]): string {
  if (!tasks.length)
    return 'You support a spoken language-practice conversation. Answer in one short sentence.';
  return [
    'You record progress in a spoken language-practice conversation. The voice model tells you when the learner completed a task.',
    `Tasks: ${tasks.map((t) => `${t.id} = ${taskLabel(t)}`).join('; ')}.`,
    'When told a task is done, call mark_task_done with its id (each id at most once) and reply with a single word: "recorded". Never write anything the learner should hear.',
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

/** The developer message that opens the session (initial history). */
export function openingMessage(firstName: string, learningLanguage: string): string {
  return `${firstName || 'The learner'} has just joined the call. Greet them in ${languageName(learningLanguage)} and start the conversation.`;
}
