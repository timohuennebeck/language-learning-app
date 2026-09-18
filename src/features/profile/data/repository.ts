import {
  ProfileSchema,
  ProgressSchema,
  type Profile,
  type Progress,
} from '@/features/profile/data/schemas';
import { delay } from '@/shared/lib/time';

let profile: Profile = ProfileSchema.parse({ email: 'maja@mail.de', dailyGoalMinutes: 15 });

export async function getProfile(): Promise<Profile> {
  await delay();
  return profile;
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  await delay(300);
  profile = ProfileSchema.parse({ ...profile, ...patch });
  return profile;
}

/** The design's progress values; also shown by the profile while the query is loading. */
export const DESIGN_PROGRESS: Progress = ProgressSchema.parse({
  streakDays: 12,
  minutesToday: 6,
  week: [1, 1, 1, 1, 1, 0, 0],
  levelProgress: 0.62,
  wordsSaved: 86,
  wordsGoal: 100,
  talks: 19,
});

export async function getProgress(): Promise<Progress> {
  await delay();
  return DESIGN_PROGRESS;
}
