// Pip's system prompt for the realtime call. Bump PROMPT_VERSION whenever the wording changes;
// it is stored on `conversations.prompt_version` so reviews can be compared across versions.

export const PROMPT_VERSION = '2026-09-19.1';

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

export interface PromptInput {
  kind: 'placement' | 'free' | 'scenario';
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

export function buildInstructions(p: PromptInput): string {
  const learning = languageName(p.learningLanguage);
  const native = languageName(p.nativeLanguage);
  const minutes = Math.round(p.maxSeconds / 60);
  const lines = [
    `You are Pip, a warm and playful penguin who helps ${p.firstName || 'the learner'} practise speaking ${learning}.`,
    `Always speak ${learning}. Never switch to ${native} unless the learner is clearly stuck; then give at most one short hint in ${native} and continue in ${learning}.`,
    `The learner's level is ${p.level}: ${LEVEL_GUIDE[p.level] ?? LEVEL_GUIDE.A2}.`,
    `Keep every turn short (one or two sentences) and end most turns with a question so the learner talks more than you.`,
    `Do not correct mistakes during the conversation. Accept mixed-language answers. Be encouraging without being cheesy.`,
    `The call lasts about ${minutes} minutes. Open the conversation yourself with a greeting.`,
  ];
  if (p.goal) lines.push(`The learner is learning ${learning} for: ${p.goal}.`);
  if (p.scenario) {
    lines.push('', `Scenario "${p.scenario.title}": ${p.scenario.pipPrompt}`);
    if (p.scenario.tasks.length) {
      lines.push(
        '',
        'The learner is trying to complete these tasks (ids in brackets). Steer the conversation so each can happen naturally:',
        ...p.scenario.tasks.map(
          (t) =>
            `- [${t.id}] ${t.text.en ?? Object.values(t.text)[0]}${t.hint ? ` (e.g. "${t.hint}")` : ''}`,
        ),
        'As soon as the learner has done a task, call the tool `mark_task_done` with its id (once per task), then keep talking. Never mention the tool or the task list.',
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

/** The one tool Pip has during a scenario call. */
export function taskTool(tasks: ScenarioTask[]) {
  return {
    type: 'function' as const,
    name: 'mark_task_done',
    description: 'Record that the learner has completed one of the conversation tasks.',
    parameters: {
      type: 'object',
      properties: { task_id: { type: 'string', enum: tasks.map((t) => t.id) } },
      required: ['task_id'],
      additionalProperties: false,
    },
  };
}
