import { useCallback } from 'react';

import { haptic, type HapticKind } from '@/shared/lib/haptics';

/** Returns stable helpers that wrap a handler with haptic feedback. */
export function useHaptics() {
  const withHaptic = useCallback(
    <A extends unknown[]>(kind: HapticKind, fn?: (...args: A) => void) =>
      (...args: A) => {
        haptic(kind);
        fn?.(...args);
      },
    [],
  );
  return { haptic, withHaptic };
}
