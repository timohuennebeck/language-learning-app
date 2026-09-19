import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Level } from '@/features/auth/data/types';
import {
  FIRST_PLACEMENT_TEXT,
  passes,
  placementTexts,
  type PlacementText,
} from '@/features/onboarding/data/placement';

export type Round = 1 | 2;

export interface RoundStats {
  taps: number;
  correct: number;
  total: number;
  /** Share of words not tapped, 0–100. */
  knownPct: number;
  /** Words tapped as unknown (become flashcards). */
  cards: string[];
}

/** Strips punctuation around a token so the flashcard shows the bare word. */
export function bareWord(token: string) {
  return token.replace(/^[«"“(]+|[»"”),.;:!?…]+$/g, '');
}

interface Store {
  textFor: (round: Round) => PlacementText;
  wordsFor: (round: Round) => string[];
  tappedFor: (round: Round) => Set<number>;
  answersFor: (round: Round) => (boolean | undefined)[];
  statsFor: (round: Round) => RoundStats;
  readingLevel: Level | null;
  toggleWord: (round: Round, i: number) => void;
  setAnswer: (round: Round, q: number, value: boolean) => void;
}

const PlacementContext = createContext<Store | null>(null);

/**
 * State of the two-round reading placement. Everything is keyed by round and derived on read, so
 * the pushed screens stay correct when the user navigates back (a round-1 screen keeps showing
 * round 1) and re-answering a question replaces the old answer instead of adding to it.
 */
export function PlacementProvider({ children }: { children: ReactNode }) {
  const [tapped, setTapped] = useState<Record<Round, Set<number>>>({ 1: new Set(), 2: new Set() });
  const [answers, setAnswers] = useState<Record<Round, (boolean | undefined)[]>>({ 1: [], 2: [] });

  const first = placementTexts[FIRST_PLACEMENT_TEXT];
  const words = useCallback((t: PlacementText) => t.text.split(/\s+/), []);

  const stats = useCallback(
    (t: PlacementText, taps: Set<number>, given: (boolean | undefined)[]): RoundStats => {
      const w = words(t);
      const correct = t.questions.filter((q, i) => given[i] === q.answer).length;
      return {
        taps: taps.size,
        correct,
        total: t.questions.length,
        knownPct: Math.round(((w.length - taps.size) / w.length) * 100),
        cards: Array.from(taps)
          .sort((a, b) => a - b)
          .map((i) => bareWord(w[i]))
          .filter(Boolean),
      };
    },
    [words],
  );

  const value = useMemo<Store>(() => {
    const round1 = stats(first, tapped[1], answers[1]);
    const b = first.branch;
    const secondId =
      b && passes(b.harderIf, round1.taps, round1.correct) ? b.harderIf.next : b?.otherwise.next;
    const second = placementTexts[secondId ?? FIRST_PLACEMENT_TEXT];
    const round2 = stats(second, tapped[2], answers[2]);
    const p = second.placement;
    const readingLevel =
      p && answers[2].length === second.questions.length
        ? passes(p.passIf, round2.taps, round2.correct)
          ? p.passIf.readingLevel
          : p.otherwise.readingLevel
        : null;
    const textFor = (r: Round) => (r === 1 ? first : second);
    return {
      textFor,
      wordsFor: (r) => words(textFor(r)),
      tappedFor: (r) => tapped[r],
      answersFor: (r) => answers[r],
      statsFor: (r) => (r === 1 ? round1 : round2),
      readingLevel,
      toggleWord: (r, i) =>
        setTapped((s) => {
          const next = new Set(s[r]);
          if (next.has(i)) next.delete(i);
          else next.add(i);
          return { ...s, [r]: next };
        }),
      setAnswer: (r, q, v) =>
        setAnswers((a) => {
          const next = [...a[r]];
          next[q] = v;
          return { ...a, [r]: next };
        }),
    };
  }, [answers, first, stats, tapped, words]);

  return <PlacementContext.Provider value={value}>{children}</PlacementContext.Provider>;
}

export function usePlacement(): Store {
  const ctx = useContext(PlacementContext);
  if (!ctx) throw new Error('usePlacement must be used inside <PlacementProvider>');
  return ctx;
}

/** Parses the `round` route param (defaults to round 1). */
export function roundParam(v: string | undefined): Round {
  return v === '2' ? 2 : 1;
}
