'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/button';
import { AccountBrandHeader } from '@/components/ui/account-flow-shell';
import { Card } from '@/components/ui/feedback';
import { Input, PasswordVisibilityButton } from '@/components/ui/forms';
import { useAuth } from '@/lib/demo-auth';
import {
  destinationForAdminSession,
  getStoredAdminRole,
  isAdminRole,
  subscribeStoredAdminRole,
} from '@/lib/admin-access';
import {
  adminInvitations,
  getAdminInvitation,
} from '@/lib/local-admin-account';

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
  const storedRole = useSyncExternalStore(
    subscribeStoredAdminRole,
    getStoredAdminRole,
    () => null,
  );
  const assignedInvitation = adminInvitations.find(
    (invitation) =>
      invitation.email.toLowerCase() === email.trim().toLowerCase(),
  );
  const rememberedInvitation = adminInvitations.find(
    (invitation) => invitation.role === storedRole,
  );
  const setupCode =
    invitationCode ??
    assignedInvitation?.code ??
    rememberedInvitation?.code ??
    (process.env.NODE_ENV === 'development'
      ? adminInvitations[0].code
      : undefined);

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
        <Card className="mt-3 gap-3 p-4 sm:p-5">
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold leading-7">Welcome to Safira</h1>
            <p className="text-sm text-graphite">
              Sign in with your assigned account.
            </p>
          </div>
          {loading ? (
            <p role="status">Opening Safira…</p>
          ) : (
            <form
              className="grid gap-2.5"
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
              <div className="grid gap-1">
                <Input
                  label="Password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  endAdornment={
                    <PasswordVisibilityButton
                      visible={passwordVisible}
                      onToggle={() => setPasswordVisible(!passwordVisible)}
                    />
                  }
                />
                <button
                  type="button"
                  onClick={() => setRecoveryOpen(!recoveryOpen)}
                  className="justify-self-end rounded-sm text-sm font-semibold text-deepCharcoal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow"
                  aria-expanded={recoveryOpen}
                >
                  Forgot password?
                </button>
              </div>
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
          <div className="border-t border-coolConcrete pt-3">
            <p className="text-sm font-semibold">New to Safira?</p>
            <p className="mt-1 text-sm text-graphite">
              Use the invitation link sent by your organisation to set up your
              account.
            </p>
            <ButtonLink
              href={
                setupCode
                  ? `/invite?code=${encodeURIComponent(setupCode)}`
                  : '/invite'
              }
              variant="secondary"
              className="mt-3 w-full"
            >
              Set up your account
            </ButtonLink>
          </div>
        </Card>
      </div>
    </main>
  );
}
