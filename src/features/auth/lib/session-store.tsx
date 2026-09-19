import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  deleteAccount as deleteAccountRequest,
  ensureUser,
  loadSession,
  saveSession,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from '@/features/auth/data/repository';
import { DEFAULT_SESSION, SessionSchema, type Session } from '@/features/auth/data/schemas';
import { acceptCurrentLegalDocuments } from '@/features/legal/data/repository';
import { detectLanguage, setAppLanguage } from '@/shared/lib/i18n';
import { readJson, removeKey, writeJson } from '@/shared/lib/storage';
import { supabase } from '@/shared/lib/supabase';

/** Offline copy of the last loaded session (used only when Supabase cannot be reached). */
const SESSION_CACHE_KEY = 'yori.session.v2';

type SessionContextValue = {
  status: 'loading' | 'ready';
  session: Session;
  /** Message of the last failed write or load; cleared by the next successful one. */
  error: string | null;
  /** Optimistic update: the UI changes immediately, the row is written in the background. */
  update: (patch: Partial<Session>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  /** Records acceptance of the current terms + privacy policy for this user. */
  acceptLegal: () => Promise<void>;
  /** Converts the anonymous user into an email account (or creates one) and reloads. */
  signUp: (email: string, password: string) => Promise<Session>;
  signIn: (email: string, password: string) => Promise<Session>;
  /** Signs out; a fresh anonymous session follows, so the app returns to onboarding. */
  reset: () => Promise<void>;
  /** Deletes the account server-side, then starts a fresh anonymous session. */
  deleteAccount: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [session, setSessionState] = useState<Session>(DEFAULT_SESSION);
  const [error, setError] = useState<string | null>(null);
  /** Latest session for async callbacks (state would be stale inside the write queue). */
  const sessionRef = useRef<Session>(DEFAULT_SESSION);
  /** Writes run one after another, in the order the user made them. */
  const queue = useRef<Promise<void>>(Promise.resolve());

  const setSession = useCallback((next: Session) => {
    sessionRef.current = next;
    setSessionState(next);
    void setAppLanguage(next.appLanguage);
    void writeJson(SESSION_CACHE_KEY, next);
  }, []);

  /** Ensures a user (anonymous if needed) and loads their rows; falls back to the cache offline. */
  const load = useCallback(async (): Promise<Session> => {
    try {
      const user = await ensureUser();
      const next = await loadSession(user);
      setSession(next);
      setError(null);
      return next;
    } catch (e) {
      const cached = await readJson(SESSION_CACHE_KEY, SessionSchema);
      const fallback = cached ?? { ...DEFAULT_SESSION, appLanguage: detectLanguage() };
      sessionRef.current = fallback;
      setSessionState(fallback);
      void setAppLanguage(fallback.appLanguage);
      setError(e instanceof Error ? e.message : String(e));
      return fallback;
    } finally {
      setStatus('ready');
    }
  }, [setSession]);

  useEffect(() => {
    // Off the effect's own tick: the load resolves asynchronously and sets state on completion.
    queueMicrotask(() => void load());
    // Reload when Auth changes the user under us (email set, another device signed out, …).
    // The callback must not call Supabase synchronously (documented deadlock), hence setTimeout.
    const { data } = supabase.auth.onAuthStateChange((event, authSession) => {
      const sameUser = authSession?.user.id === sessionRef.current.userId;
      if (
        event === 'SIGNED_OUT' ||
        event === 'USER_UPDATED' ||
        (event === 'SIGNED_IN' && !sameUser)
      ) {
        setTimeout(() => void load(), 0);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [load]);

  const update = useCallback(
    (patch: Partial<Session>) => {
      const next = { ...sessionRef.current, ...patch };
      setSession(next);
      queue.current = queue.current
        .then(() => saveSession(next, patch))
        .then(() => setError(null))
        .catch(async (e: unknown) => {
          setError(e instanceof Error ? e.message : String(e));
          // Show the server's truth again rather than a change that did not stick.
          await load();
        });
    },
    [load, setSession],
  );

  /** Restart from a clean auth state: the tree unmounts while loading, then remounts at `/`. */
  const restart = useCallback(
    async (action: () => Promise<void>) => {
      setStatus('loading');
      await queue.current.catch(() => {});
      try {
        await action();
      } finally {
        await removeKey(SESSION_CACHE_KEY);
        await load();
      }
    },
    [load],
  );

  const acceptLegal = useCallback(async () => {
    const { userId, appLanguage } = sessionRef.current;
    if (!userId) return;
    await acceptCurrentLegalDocuments(userId, appLanguage);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      session,
      error,
      update,
      completeOnboarding: () => update({ onboardingComplete: true }),
      resetOnboarding: () => update({ onboardingComplete: false }),
      acceptLegal,
      signUp: async (email, password) => {
        await queue.current.catch(() => {});
        await signUpWithEmail(email, password);
        const next = await load();
        // Best effort: the acceptance at "Los geht's" already exists for this version.
        acceptLegal().catch(() => {});
        return next;
      },
      signIn: async (email, password) => {
        await queue.current.catch(() => {});
        await signInWithEmail(email, password);
        return load();
      },
      reset: () => restart(signOut),
      deleteAccount: () => restart(deleteAccountRequest),
    }),
    [status, session, error, update, acceptLegal, load, restart],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
