import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Class merger aware of the project's custom utilities:
 * - `font-regular|medium|semibold|bold` are font *families* (Inter faces), not weights.
 */
export const twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      'font-weight': [],
      'font-family': [{ font: ['sans', 'regular', 'medium', 'semibold', 'bold'] }],
    },
  },
});

export type ClassValue = string | number | null | undefined | false | ClassValue[];

function flatten(values: ClassValue[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (Array.isArray(v)) out.push(...flatten(v));
    else out.push(String(v));
  }
  return out;
}

export function cn(...values: ClassValue[]): string {
  return twMerge(flatten(values).join(' '));
}
