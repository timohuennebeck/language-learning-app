import type { TranscriptTurn } from '@/features/live/data/types';

/** A pause in one speaker's transcript longer than this starts a new turn. */
const TURN_GAP_MS = 2000;

/**
 * Groups the Live API's timed transcript deltas (`session.input_transcript.delta`,
 * `session.output_transcript.delta`) into turns: a speaker change or a pause closes a turn.
 */
export class TranscriptCollector {
  private turns: TranscriptTurn[] = [];
  private open: { role: TranscriptTurn['role']; text: string; endMs: number } | null = null;

  add(role: TranscriptTurn['role'], delta: string, startMs: number, endMs: number) {
    if (this.open && (this.open.role !== role || startMs - this.open.endMs > TURN_GAP_MS))
      this.flush();
    if (!this.open) this.open = { role, text: '', endMs };
    this.open.text += delta;
    this.open.endMs = Math.max(this.open.endMs, endMs);
  }

  /** The turns so far, including the one still being spoken. */
  all(): TranscriptTurn[] {
    const current = this.open?.text.trim();
    return current ? [...this.turns, { role: this.open!.role, text: current }] : [...this.turns];
  }

  /** Pip's current line, for the subtitle. */
  currentAssistantLine(): string {
    return this.open?.role === 'assistant' ? this.open.text.trim() : '';
  }

  private flush() {
    const text = this.open?.text.trim();
    if (this.open && text) this.turns.push({ role: this.open.role, text });
    this.open = null;
  }
}
