'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createLocalDemoAuthProvider, type AuthSession } from '@safira/auth';
import { useRouter } from 'next/navigation';
import { AdminLaunchSplash } from '@/components/ui/launch-splash';
import { rememberAdminRole } from './admin-access';
import {
  getPreviewAccountByEmail,
  verifyPreviewAccount,
} from './preview-accounts';
import {
  createLocalPassword,
  getAdminInvitation,
  matchesLocalPassword,
  readLocalAdminAccount,
  saveLocalAdminAccount,
  type LocalAdminAccount,
} from './local-admin-account';

const adapter = createLocalDemoAuthProvider(() => window.localStorage);
const credentialSessionKey = 'safira.admin.credential-session.v1';

interface DemoAuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  account: LocalAdminAccount | null;
  activate(code: string, password: string): Promise<boolean>;
  completeProfile(
    fullName: string,
    jobTitle: string,
    photoUrl?: string,
  ): boolean;
  signIn(email: string, password: string): Promise<boolean>;
  signOut(): Promise<void>;
}

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [brandReady, setBrandReady] = useState(false);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<LocalAdminAccount | null>(null);

  useEffect(() => {
    if (!brandReady) return;
    const timer = setTimeout(() => setMinimumElapsed(true), 3500);
    return () => clearTimeout(timer);
  }, [brandReady]);

  useEffect(() => {
    let active = true;
    async function syncSession() {
      try {
        const saved = await adapter.getSession();
        if (active) {
          const email = window.localStorage.getItem(credentialSessionKey);
          const assigned = email ? getPreviewAccountByEmail(email) : null;
          const localAccount = email ? readLocalAdminAccount(email) : null;
          if (
            saved &&
            (!assigned ||
              assigned.role !== saved.role ||
              (localAccount && localAccount.role !== saved.role))
          ) {
            await adapter.signOut();
            window.localStorage.removeItem(credentialSessionKey);
            setSession(null);
            setAccount(null);
          } else {
            setSession(
              saved && localAccount
                ? { ...saved, userId: `local:${localAccount.email}` }
                : saved,
            );
            setAccount(saved ? localAccount : null);
            if (saved) rememberAdminRole(saved.role);
          }
        }
      } catch {
        if (active) setError('Your session could not be restored.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void syncSession();
    window.addEventListener('storage', syncSession);
    return () => {
      active = false;
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  async function signIn(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const localAccount = readLocalAdminAccount(normalizedEmail);
    const assigned = localAccount
      ? localAccount.role === getPreviewAccountByEmail(normalizedEmail)?.role &&
        (await matchesLocalPassword(localAccount, password))
        ? getPreviewAccountByEmail(normalizedEmail)
        : null
      : verifyPreviewAccount(normalizedEmail, password);
    if (!assigned) {
      setError('Enter a valid email and password.');
      return false;
    }
    try {
      const saved = await adapter.signIn(assigned.role);
      window.localStorage.setItem(credentialSessionKey, assigned.email);
      setSession(
        localAccount
          ? { ...saved, userId: `local:${localAccount.email}` }
          : saved,
      );
      setAccount(localAccount);
      rememberAdminRole(assigned.role);
      setError(null);
      return true;
    } catch {
      setError('Could not sign in. Please try again.');
      return false;
    }
  }

  async function activate(code: string, password: string) {
    const invitation = getAdminInvitation(code);
    if (!invitation) {
      setError(
        'This invitation is unavailable. Ask your organisation for a current link.',
      );
      return false;
    }
    if (readLocalAdminAccount(invitation.email)) {
      setError('This account is already set up. Sign in to continue.');
      return false;
    }
    try {
      const verifier = await createLocalPassword(password);
      const next: LocalAdminAccount = {
        email: invitation.email,
        role: invitation.role,
        organisation: invitation.organisation,
        site: 'site' in invitation ? invitation.site : undefined,
        fullName: '',
        jobTitle: '',
        passwordSalt: verifier.salt,
        passwordDigest: verifier.digest,
        profileComplete: false,
      };
      saveLocalAdminAccount(next);
      const saved = await adapter.signIn(next.role);
      window.localStorage.setItem(credentialSessionKey, next.email);
      setAccount(next);
      setSession({ ...saved, userId: `local:${next.email}` });
      rememberAdminRole(next.role);
      setError(null);
      return true;
    } catch {
      setError(
        'Your account could not be saved on this device. Please try again.',
      );
      return false;
    }
  }

  function completeProfile(
    fullName: string,
    jobTitle: string,
    photoUrl?: string,
  ) {
    if (!account || !session) return false;
    try {
      const next = {
        ...account,
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        photoUrl,
        profileComplete: true,
      };
      saveLocalAdminAccount(next);
      setAccount(next);
      setError(null);
      return true;
    } catch {
      setError('Your profile could not be saved on this device.');
      return false;
    }
  }

  async function signOut() {
    try {
      await adapter.signOut();
      window.localStorage.removeItem(credentialSessionKey);
      setSession(null);
      setAccount(null);
      setError(null);
      router.replace('/sign-in');
    } catch {
      setError('Could not sign out. Please try again.');
    }
  }

  return (
    <DemoAuthContext.Provider
      value={{
        session,
        loading,
        error,
        account,
        activate,
        completeProfile,
        signIn,
        signOut,
      }}
    >
      {loading || !minimumElapsed || !splashFinished ? (
        <AdminLaunchSplash
          onBrandReady={() => setBrandReady(true)}
          readyToFinish={!loading && minimumElapsed}
          onFinished={() => setSplashFinished(true)}
        />
      ) : (
        children
      )}
    </DemoAuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(DemoAuthContext);
  if (!context)
    throw new Error('useAuth must be used inside DemoAuthProvider.');
  return context;
}
