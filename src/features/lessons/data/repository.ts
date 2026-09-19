import {
  ChapterSchema,
  HomeFeedSchema,
  LessonSchema,
  type Chapter,
  type HomeFeed,
  type Lesson,
} from '@/features/lessons/data/schemas';
import { delay } from '@/shared/lib/time';

/**
 * In-memory repository with the design's sample content. Swap the bodies for
 * Supabase queries later; the query keys and hooks stay the same.
 */
const lessons: Lesson[] = [
  {
    id: 'se-presenter',
    title: 'Se présenter',
    meta: 'Kennenlernen · 6 Min',
    placeholder: 'Illustration: Sprechblasen',
  },
  {
    id: 'demander-chemin',
    title: 'Demander son chemin',
    meta: 'Weg finden · 5 Min',
    placeholder: 'Illustration: Stadtplan',
  },
  {
    id: 'au-restaurant',
    title: 'Au restaurant',
    meta: 'Abendessen · 7 Min',
    placeholder: 'Illustration: Abendessen',
  },
  {
    id: 'a-la-reception',
    title: 'À la réception',
    meta: 'Einchecken · 6 Min',
    placeholder: 'Illustration: Koffer',
  },
].map((l) => LessonSchema.parse(l));

export async function getChapter(id: string): Promise<Chapter> {
  await delay();
  return ChapterSchema.parse({
    id,
    title: 'Im Café',
    stations: ['read', 'cards', 'grammar', 'practice', 'live'],
    current: 0,
  });
}

export async function getHomeFeed(): Promise<HomeFeed> {
  await delay();
  return HomeFeedSchema.parse({ minutesToday: 6, goalMinutes: 10, dueCards: 12, lessons });
}
