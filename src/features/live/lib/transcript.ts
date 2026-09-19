import type { TranscriptTurn } from '@/features/live/data/types';

/** A pause in one speaker's transcript longer than this starts a new turn. */
const TURN_GAP_MS = 2000;
/** Words of Pip's line kept in the caption, so it always fits one line. */
const CAPTION_WORDS = 2;

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

  /**
   * The tail of Pip's current line, for the caption under the call. Only the last `words` words
   * are shown: a full sentence wraps to three lines and jumps around while it is being spoken,
   * so the caption keeps pace with the audio instead of re-flowing.
   */
  currentCaption(words = CAPTION_WORDS): string {
    if (this.open?.role !== 'assistant') return '';
    const spoken = this.open.text.split(/\s+/).filter(Boolean);
    return spoken.slice(-words).join(' ');
  }

  private flush() {
    const text = this.open?.text.trim();
    if (this.open && text) this.turns.push({ role: this.open.role, text });
    this.open = null;
  }
}
