import { useContext } from 'react';

import { SessionContext, type SessionContextValue } from '@/features/auth/lib/session-store';

/** The local session (name, level, goal, reminder…) and its updaters. */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
