import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_SESSION, SessionSchema, type Session } from '@/features/auth/data/schemas';
import { detectLanguage, setAppLanguage } from '@/shared/lib/i18n';
import { readJson, writeJson } from '@/shared/lib/storage';

const SESSION_STORAGE_KEY = 'yori.session.v1';

export type SessionContextValue = {
  status: 'loading' | 'ready';
  session: Session;
  update: (patch: Partial<Session>) => void;
  completeOnboarding: () => void;
  /** Wipe the stored session and start from the defaults (account deletion). */
  reset: () => void;
};

/** Read through `useSession()` (features/auth/hooks). */
export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [session, setSession] = useState<Session>(DEFAULT_SESSION);
  /** Skips persisting until the stored session has been read, so a render never overwrites it. */
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    readJson(SESSION_STORAGE_KEY, SessionSchema).then((stored) => {
      if (cancelled) return;
      if (stored) {
        setSession(stored);
        void setAppLanguage(stored.appLanguage);
      } else {
        const appLanguage = detectLanguage();
        setSession({ ...DEFAULT_SESSION, appLanguage });
        void setAppLanguage(appLanguage);
      }
      hydrated.current = true;
      setStatus('ready');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Side effects live outside the state updater (which React may call twice in dev).
  useEffect(() => {
    if (!hydrated.current) return;
    void setAppLanguage(session.appLanguage);
    void writeJson(SESSION_STORAGE_KEY, session);
  }, [session]);

  const update = useCallback((patch: Partial<Session>) => {
    setSession((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      session,
      update,
      completeOnboarding: () => update({ onboardingComplete: true }),
      reset: () => setSession({ ...DEFAULT_SESSION, appLanguage: detectLanguage() }),
    }),
    [status, session, update],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
