import { z } from 'zod';

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  meta: z.string(),
  /** Illustration placeholder caption until artwork is provided. */
  placeholder: z.string(),
  badge: z.string().optional(),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const StationKindSchema = z.enum(['read', 'cards', 'grammar', 'practice', 'live']);
export type StationKind = z.infer<typeof StationKindSchema>;

export const ChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  stations: z.array(StationKindSchema),
  /** Zero-based index of the current (expanded) station. */
  current: z.number().int().min(0),
});
export type Chapter = z.infer<typeof ChapterSchema>;

export const HomeFeedSchema = z.object({
  minutesToday: z.number().int(),
  goalMinutes: z.number().int(),
  dueCards: z.number().int(),
  lessons: z.array(LessonSchema),
});
export type HomeFeed = z.infer<typeof HomeFeedSchema>;
