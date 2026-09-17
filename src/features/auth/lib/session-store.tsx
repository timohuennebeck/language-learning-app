import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_SESSION, SessionSchema, type Session } from '@/features/auth/data/schemas';
import { setAppLanguage } from '@/shared/lib/i18n';
import { readJson, writeJson } from '@/shared/lib/storage';

const STORAGE_KEY = 'yori.session.v1';

type SessionContextValue = {
  status: 'loading' | 'ready';
  session: Session;
  update: (patch: Partial<Session>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [session, setSession] = useState<Session>(DEFAULT_SESSION);

  useEffect(() => {
    let cancelled = false;
    readJson(STORAGE_KEY, SessionSchema).then((stored) => {
      if (cancelled) return;
      if (stored) setSession(stored);
      void setAppLanguage(stored?.appLanguage ?? DEFAULT_SESSION.appLanguage);
      setStatus('ready');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((patch: Partial<Session>) => {
    setSession((prev) => {
      const next = { ...prev, ...patch };
      if (patch.appLanguage && patch.appLanguage !== prev.appLanguage)
        void setAppLanguage(patch.appLanguage);
      void writeJson(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      session,
      update,
      completeOnboarding: () => update({ onboardingComplete: true }),
      resetOnboarding: () => update({ onboardingComplete: false }),
    }),
    [status, session, update],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
