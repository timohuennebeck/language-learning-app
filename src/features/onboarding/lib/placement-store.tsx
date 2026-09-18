import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Level } from '@/features/auth/data/schemas';
import {
  FIRST_PLACEMENT_TEXT,
  passes,
  placementTexts,
  type PlacementText,
} from '@/features/onboarding/data/placement';

export type RoundResult = {
  /** Share of words not tapped, 0–100. */
  knownPct: number;
  /** Words tapped as unknown (become flashcards). */
  cards: string[];
  correct: number;
  total: number;
};

/** Strips punctuation around a token so the flashcard shows the bare word. */
export function bareWord(token: string) {
  return token.replace(/^[«"“(]+|[»"”),.;:!?…]+$/g, '');
}

type Store = {
  round: 1 | 2;
  text: PlacementText;
  words: string[];
  tapped: Set<number>;
  qIndex: number;
  /** Result of the round that was just answered. */
  result: RoundResult | undefined;
  readingLevel: Level | null;
  toggleWord: (i: number) => void;
  /** Called when leaving the text: resets the question counter for this round. */
  startQuestions: () => void;
  /** Records an answer; tells the screen whether another question follows. */
  answer: (value: boolean) => 'question' | 'result';
  /** Leaves the result: prepares round 2 or reports the reading part done. */
  nextRound: () => 'round2' | 'done';
};

const PlacementContext = createContext<Store | null>(null);

/**
 * State of the two-round reading placement, shared by the reading, question and result routes
 * so each step can be its own screen with a normal push transition.
 */
export function PlacementProvider({ children }: { children: ReactNode }) {
  const [round, setRound] = useState<1 | 2>(1);
  const [textId, setTextId] = useState(FIRST_PLACEMENT_TEXT);
  const [tapped, setTapped] = useState<Set<number>>(() => new Set());
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [readingLevel, setReadingLevel] = useState<Level | null>(null);

  const text = placementTexts[textId];
  const words = useMemo(() => text.text.split(/\s+/), [text]);

  const toggleWord = useCallback((i: number) => {
    setTapped((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const startQuestions = useCallback(() => {
    setQIndex(0);
    setCorrect(0);
  }, []);

  const answer = useCallback(
    (value: boolean): 'question' | 'result' => {
      const right = value === text.questions[qIndex].answer;
      const nextCorrect = correct + (right ? 1 : 0);
      setCorrect(nextCorrect);
      if (qIndex + 1 < text.questions.length) {
        setQIndex(qIndex + 1);
        return 'question';
      }
      const taps = tapped.size;
      setResults((r) => [
        ...r,
        {
          knownPct: Math.round(((words.length - taps) / words.length) * 100),
          cards: Array.from(tapped)
            .sort((a, b) => a - b)
            .map((i) => bareWord(words[i]))
            .filter(Boolean),
          correct: nextCorrect,
          total: text.questions.length,
        },
      ]);
      if (text.placement) {
        const p = text.placement;
        setReadingLevel(
          passes(p.passIf, taps, nextCorrect) ? p.passIf.readingLevel : p.otherwise.readingLevel,
        );
      }
      return 'result';
    },
    [correct, qIndex, tapped, text, words],
  );

  const nextRound = useCallback((): 'round2' | 'done' => {
    if (round === 1 && text.branch) {
      const b = text.branch;
      const last = results[results.length - 1];
      const harder = last !== undefined && passes(b.harderIf, tapped.size, last.correct);
      setTextId(harder ? b.harderIf.next : b.otherwise.next);
      setRound(2);
      setTapped(new Set());
      setQIndex(0);
      setCorrect(0);
      return 'round2';
    }
    return 'done';
  }, [results, round, tapped, text]);

  const value = useMemo<Store>(
    () => ({
      round,
      text,
      words,
      tapped,
      qIndex,
      result: results[results.length - 1],
      readingLevel,
      toggleWord,
      startQuestions,
      answer,
      nextRound,
    }),
    [
      round,
      text,
      words,
      tapped,
      qIndex,
      results,
      readingLevel,
      toggleWord,
      startQuestions,
      answer,
      nextRound,
    ],
  );
  return <PlacementContext.Provider value={value}>{children}</PlacementContext.Provider>;
}

export function usePlacement(): Store {
  const ctx = useContext(PlacementContext);
  if (!ctx) throw new Error('usePlacement must be used inside <PlacementProvider>');
  return ctx;
}
