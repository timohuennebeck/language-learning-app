import {
  ProfileSchema,
  ProgressSchema,
  type Profile,
  type Progress,
} from '@/features/profile/data/schemas';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

let profile: Profile = ProfileSchema.parse({
  name: 'Maja',
  email: 'maja@mail.de',
  plusActive: true,
  learningLanguage: 'fr',
  appLanguage: 'de',
  dailyGoalMinutes: 15,
  reminderTime: '20:30',
});

export async function getProfile(): Promise<Profile> {
  await delay();
  return profile;
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  await delay(300);
  profile = ProfileSchema.parse({ ...profile, ...patch });
  return profile;
}

export async function getProgress(): Promise<Progress> {
  await delay();
  return ProgressSchema.parse({
    streakDays: 12,
    minutesToday: 6,
    week: [1, 1, 1, 1, 1, 0, 0],
    levelProgress: 0.62,
    wordsSaved: 86,
    wordsGoal: 100,
    talks: 19,
    talksLast30: 6,
  });
}
