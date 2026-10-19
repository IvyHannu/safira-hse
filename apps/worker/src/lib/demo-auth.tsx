import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  clearSession,
  createPasswordVerifier,
  getInvitation,
  matchesPassword,
  readAccount,
  readSignedInAccount,
  saveAccount,
  type WorkerAccount,
} from '@/auth/local-account';

interface WorkerSession {
  role: 'worker';
  email: string;
}

interface WorkerAuthContextValue {
  account: WorkerAccount | null;
  session: WorkerSession | null;
  loading: boolean;
  error: string | null;
  activate(code: string, password: string): Promise<boolean>;
  signIn(email: string, password: string): Promise<boolean>;
  completeProfile(fullName: string, jobTitle: string): boolean;
  finishOnboarding(): boolean;
  signOut(): Promise<void>;
}

const WorkerAuthContext = createContext<WorkerAuthContextValue | null>(null);

/** Local account preview only; this provider never grants server permissions. */
export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<WorkerAccount | null>(null);
  const [session, setSession] = useState<WorkerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = readAccount();
        const signedIn = readSignedInAccount();
        setAccount(saved);
        setSession(signedIn ? { role: 'worker', email: signedIn.email } : null);
      } catch {
        setError('Your local account could not be loaded. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function activate(code: string, password: string) {
    const invitation = getInvitation(code);
    if (!invitation) {
      setError(
        'This invitation is unavailable. Ask your organisation for a new link.',
      );
      return false;
    }
    if (readAccount()?.email === invitation.email) {
      setError('This account is already set up. Sign in to continue.');
      return false;
    }
    try {
      const verifier = createPasswordVerifier(password);
      const next: WorkerAccount = {
        email: invitation.email,
        organisation: invitation.organisation,
        site: invitation.site,
        fullName: '',
        jobTitle: '',
        passwordSalt: verifier.salt,
        passwordDigest: verifier.digest,
        profileComplete: false,
        onboardingComplete: false,
      };
      saveAccount(next);
      setAccount(next);
      setSession({ role: 'worker', email: next.email });
      setError(null);
      return true;
    } catch {
      setError(
        'Your account could not be saved on this device. Please try again.',
      );
      return false;
    }
  }

  async function signIn(email: string, password: string) {
    const saved = readAccount();
    if (
      !saved ||
      saved.email.toLowerCase() !== email.trim().toLowerCase() ||
      !matchesPassword(saved, password)
    ) {
      setError('Email or password is incorrect.');
      return false;
    }
    try {
      saveAccount(saved);
      setAccount(saved);
      setSession({ role: 'worker', email: saved.email });
      setError(null);
      return true;
    } catch {
      setError('Could not sign in on this device. Please try again.');
      return false;
    }
  }

  function updateAccount(update: Partial<WorkerAccount>) {
    if (!account || !session) return false;
    try {
      const next = { ...account, ...update };
      saveAccount(next);
      setAccount(next);
      setError(null);
      return true;
    } catch {
      setError('Your changes could not be saved on this device.');
      return false;
    }
  }

  function completeProfile(fullName: string, jobTitle: string) {
    return updateAccount({
      fullName: fullName.trim(),
      jobTitle: jobTitle.trim(),
      profileComplete: true,
    });
  }

  function finishOnboarding() {
    return updateAccount({ onboardingComplete: true });
  }

  async function signOut() {
    try {
      clearSession();
      setSession(null);
      setError(null);
    } catch {
      setError('Could not sign out. Please try again.');
    }
  }

  return (
    <WorkerAuthContext.Provider
      value={{
        account,
        session,
        loading,
        error,
        activate,
        signIn,
        completeProfile,
        finishOnboarding,
        signOut,
      }}
    >
      {children}
    </WorkerAuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(WorkerAuthContext);
  if (!context)
    throw new Error('useAuth must be used inside DemoAuthProvider.');
  return context;
}
