export interface Lesson {
  id: string;
  title: string;
  meta: string;
  /** Illustration placeholder caption until artwork is provided. */
  placeholder: string;
}

export type StationKind = 'read' | 'cards' | 'grammar' | 'practice' | 'live';

export interface Chapter {
  id: string;
  title: string;
  stations: StationKind[];
  /** Zero-based index of the current (expanded) station. */
  current: number;
}

export interface HomeFeed {
  minutesToday: number;
  goalMinutes: number;
  dueCards: number;
  lessons: Lesson[];
}
