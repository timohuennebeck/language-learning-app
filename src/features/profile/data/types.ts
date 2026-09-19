/** Server-side profile; the rest of the user state lives in the session. */
export interface Profile {
  email: string;
  dailyGoalMinutes: number;
}

export interface Progress {
  streakDays: number;
  minutesToday: number;
  /** Mon..Sun: 0 = missed, 1 = done, 2 = today (pending) */
  week: number[];
  /** 0..1 */
  levelProgress: number;
  wordsSaved: number;
  wordsGoal: number;
  talks: number;
}
