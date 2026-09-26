'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  createLocalDemoAuthProvider,
  type AuthRole,
  type AuthSession,
} from '@safira/auth';

const adapter = createLocalDemoAuthProvider(() => window.localStorage);

interface DemoAuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  signIn(role: AuthRole): Promise<boolean>;
  signOut(): Promise<void>;
}

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adapter
      .getSession()
      .then((saved) => {
        if (active) setSession(saved);
      })
      .catch(() => {
        if (active) setError('Your session could not be restored.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function signIn(role: AuthRole) {
    try {
      setSession(await adapter.signIn(role));
      setError(null);
      return true;
    } catch {
      setError('Could not save your workspace selection.');
      return false;
    }
  }

  async function signOut() {
    try {
      await adapter.signOut();
      setSession(null);
      setError(null);
    } catch {
      setError('Could not sign out. Please try again.');
    }
  }

  return (
    <DemoAuthContext.Provider
      value={{ session, loading, error, signIn, signOut }}
    >
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(DemoAuthContext);
  if (!context)
    throw new Error('useAuth must be used inside DemoAuthProvider.');
  return context;
}
