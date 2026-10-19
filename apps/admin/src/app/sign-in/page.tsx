'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { AccountBrandHeader } from '@/components/ui/account-flow-shell';
import { Card } from '@/components/ui/feedback';
import { Input } from '@/components/ui/forms';
import { useAuth } from '@/lib/demo-auth';
import { destinationForAdminSession, isAdminRole } from '@/lib/admin-access';
import { getAdminInvitation } from '@/lib/local-admin-account';

const subscribeToLocation = () => () => {};
function invitationCodeFromLocation() {
  const code = new URLSearchParams(window.location.search).get('code');
  return code && getAdminInvitation(code) ? code : null;
}

export default function AdminSignInPage() {
  const router = useRouter();
  const { session, loading, signIn, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const invitationCode = useSyncExternalStore(
    subscribeToLocation,
    invitationCodeFromLocation,
    () => null,
  );

  useEffect(() => {
    if (!loading && session && isAdminRole(session.role))
      router.replace(destinationForAdminSession(session));
  }, [loading, router, session]);

  async function submitSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-coolSurface px-4 py-8 text-deepCharcoal">
      <div className="w-full max-w-[440px]">
        <AccountBrandHeader context="" compact />
        <Card className="mt-4 gap-4 p-5 sm:p-6">
          <div className="grid gap-1">
            <h1 className="text-[26px] font-bold leading-8">
              Welcome to Safira
            </h1>
            <p className="text-sm text-graphite">
              Sign in with your assigned account.
            </p>
          </div>
          {loading ? (
            <p role="status">Opening Safira…</p>
          ) : (
            <form
              className="grid gap-3"
              onSubmit={(event) => void submitSignIn(event)}
            >
              <Input
                label="Email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                label="Password"
                type={passwordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    aria-label={
                      passwordVisible ? 'Hide password' : 'Show password'
                    }
                    className="flex size-10 items-center justify-center rounded-md text-deepCharcoal focus-visible:outline-2 focus-visible:outline-signalYellow"
                  >
                    {passwordVisible ? (
                      <EyeSlash size={18} weight="bold" />
                    ) : (
                      <Eye size={18} weight="bold" />
                    )}
                  </button>
                }
              />
              <button
                type="button"
                onClick={() => setRecoveryOpen(!recoveryOpen)}
                className="-mt-1 justify-self-end rounded-sm text-sm font-semibold text-deepCharcoal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow"
                aria-expanded={recoveryOpen}
              >
                Forgot password?
              </button>
              {recoveryOpen && (
                <p className="rounded-md border border-coolConcrete bg-coolSurface p-3 text-sm text-graphite">
                  Ask your organisation administrator for a new invitation or
                  password help.
                </p>
              )}
              {error && (
                <p role="alert" className="text-sm text-critical">
                  {error}
                </p>
              )}
              <Button type="submit" loading={submitting} className="w-full">
                Sign in
              </Button>
            </form>
          )}
          <div className="border-t border-coolConcrete pt-4">
            <p className="text-sm font-semibold">New to Safira?</p>
            <p className="mt-1 text-sm text-graphite">
              Use the invitation link sent by your organisation to set up your
              account.
            </p>
            {invitationCode && (
              <Link
                href={`/invite?code=${encodeURIComponent(invitationCode)}`}
                className="mt-3 inline-flex min-h-10 items-center rounded-md border border-graphite px-3 text-sm font-semibold text-deepCharcoal hover:bg-coolSurface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow"
              >
                Set up your account
              </Link>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
