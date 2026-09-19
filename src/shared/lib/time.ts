const pad = (n: number) => String(n).padStart(2, '0');

/** "HH:MM" from hour/minute numbers. */
export function formatTime(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

/** "MM:SS" for a call timer. */
export function formatClock(seconds: number): string {
  return formatTime(Math.floor(seconds / 60), seconds % 60);
}

/** Simulated network latency for the in-memory repositories. */
export const delay = (ms = 120) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export { pad };
