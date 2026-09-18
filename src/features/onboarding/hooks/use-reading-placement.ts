import { useMemo, useState } from 'react';

import type { Level } from '@/features/auth/data/schemas';
import {
  FIRST_PLACEMENT_TEXT,
  passes,
  placementTexts,
  type PlacementText,
} from '@/features/onboarding/data/placement';

export type Phase = 'read' | 'question' | 'result';

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

type Options = { initialPhase?: Phase };

/**
 * Two-round reading placement: round 1 is the B1 text; a strong round sends the reader to the
 * B2 text, otherwise to the A2 text. Each round: read (tap unknown words) → 3 yes/no questions
 * → result. Round 2's rule yields the reading level.
 */
export function useReadingPlacement({ initialPhase = 'read' }: Options = {}) {
  const [round, setRound] = useState<1 | 2>(1);
  const [textId, setTextId] = useState(FIRST_PLACEMENT_TEXT);
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [tapped, setTapped] = useState<Set<number>>(() => new Set());
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [readingLevel, setReadingLevel] = useState<Level | null>(null);

  const text: PlacementText = placementTexts[textId];
  const words = useMemo(() => text.text.split(/\s+/), [text]);

  const toggleWord = (i: number) =>
    setTapped((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const finishReading = () => {
    setQIndex(0);
    setCorrect(0);
    setPhase('question');
  };

  const answer = (value: boolean) => {
    const right = value === text.questions[qIndex].answer;
    const nextCorrect = correct + (right ? 1 : 0);
    setCorrect(nextCorrect);
    if (qIndex + 1 < text.questions.length) {
      setQIndex(qIndex + 1);
      return;
    }
    const taps = tapped.size;
    const result: RoundResult = {
      knownPct: Math.round(((words.length - taps) / words.length) * 100),
      cards: Array.from(tapped)
        .sort((a, b) => a - b)
        .map((i) => bareWord(words[i]))
        .filter(Boolean),
      correct: nextCorrect,
      total: text.questions.length,
    };
    setResults((r) => [...r, result]);
    if (text.placement) {
      const p = text.placement;
      setReadingLevel(
        passes(p.passIf, taps, nextCorrect) ? p.passIf.readingLevel : p.otherwise.readingLevel,
      );
    }
    setPhase('result');
  };

  /** Leaves the result screen: starts round 2, or reports `done` after round 2. */
  const next = (): 'round2' | 'done' => {
    if (round === 1 && text.branch) {
      const b = text.branch;
      const last = results[results.length - 1];
      const harder = last && passes(b.harderIf, tapped.size, last.correct);
      setTextId(harder ? b.harderIf.next : b.otherwise.next);
      setRound(2);
      setTapped(new Set());
      setPhase('read');
      return 'round2';
    }
    return 'done';
  };

  return {
    round,
    text,
    words,
    phase,
    tapped,
    question: text.questions[qIndex],
    qIndex,
    result: results[results.length - 1],
    allCards: results.flatMap((r) => r.cards),
    readingLevel,
    toggleWord,
    finishReading,
    answer,
    next,
  };
}
