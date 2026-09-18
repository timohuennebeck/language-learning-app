import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';

/** Pops the stack when possible, otherwise replaces with `fallback` (a deep-linked or dev-opened screen). */
export function useBack(fallback: Href = '/') {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  }, [router, fallback]);
}

/** Returns to the Lernen tab, dismissing every flow screen stacked above the tabs. */
export function useGoHome() {
  const router = useRouter();
  return useCallback(() => {
    if (router.canDismiss()) router.dismissAll();
    router.replace('/(app)/(tabs)');
  }, [router]);
}

/** Leaves the current flow and opens the Kurs tab at the given station. */
export function useGoToCourse() {
  const router = useRouter();
  return useCallback(
    (station: number) => {
      if (router.canDismiss()) router.dismissAll();
      router.navigate({ pathname: '/(app)/(tabs)/course', params: { station: String(station) } });
    },
    [router],
  );
}
