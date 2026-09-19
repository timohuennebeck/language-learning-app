/**
 * The six-box Leitner file. A card sits in one box; answering it right moves it one box up,
 * getting it wrong drops it back into box 1. The box alone says when the card comes back: box 1
 * is still today, and from there each box waits twice as long as the one before it.
 */
export const BOX_COUNT = 6;

/**
 * Days until a card in box 1…6 is due again. Box 1 is "again in this session": a card you have
 * just got wrong comes back today, which is what the repeat button on the results screen
 * re-serves. From box 2 on, every box waits twice as long as the one before it.
 */
export const BOX_DAYS = [0, 2, 4, 8, 16, 32] as const;

/** Right swipe: one box up, box 6 stays box 6. */
export const promote = (box: number) => Math.min(box + 1, BOX_COUNT);

/** Wrong swipe: all the way back, whatever the card had reached. */
export const FIRST_BOX = 1;

/** The local calendar day as `YYYY-MM-DD`; `due` is a date, so UTC would flip it a few hours early. */
export function toISODate(day: Date): string {
  const month = `${day.getMonth() + 1}`.padStart(2, '0');
  const date = `${day.getDate()}`.padStart(2, '0');
  return `${day.getFullYear()}-${month}-${date}`;
}

export const today = () => toISODate(new Date());

/** The day a card lands on after moving into `box`. */
export function dueAfter(box: number, from = new Date()): string {
  const due = new Date(from);
  due.setDate(due.getDate() + BOX_DAYS[box - 1]);
  return toISODate(due);
}
