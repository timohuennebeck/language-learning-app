const pad = (n: number) => String(n).padStart(2, '0');

/** "HH:MM" from hour/minute numbers. */
export function formatTime(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

/** Simulated network latency for the in-memory repositories. */
export const delay = (ms = 120) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export { pad };
