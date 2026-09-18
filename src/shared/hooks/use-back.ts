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

/** Returns to the app home, dismissing intermediate screens instead of stacking a second home. */
export function useGoHome() {
  const router = useRouter();
  return useCallback(() => {
    if (router.canDismiss()) router.dismissAll();
    router.replace('/(app)');
  }, [router]);
}
