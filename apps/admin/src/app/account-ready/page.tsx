'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from '@phosphor-icons/react';
import { AccountFlowShell } from '@/components/ui/account-flow-shell';
import { AccountContext } from '@/components/ui/account-context';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/demo-auth';
import { destinationForAdminSession } from '@/lib/admin-access';

export default function AdminAccountReadyPage() {
  const router = useRouter();
  const { account, session, loading } = useAuth();
  useEffect(() => {
    if (loading) return;
    if (!session || !account) router.replace('/sign-in');
    else if (!account.profileComplete) router.replace('/complete-profile');
    else {
      const destination = destinationForAdminSession(session);
      if (!destination.endsWith('/onboarding')) router.replace(destination);
    }
  }, [account, loading, router, session]);
  if (!account || !session)
    return <main className="min-h-dvh bg-coolSurface" />;
  const destination = destinationForAdminSession(session);
  return (
    <AccountFlowShell
      context={account.role.replaceAll('_', ' ').toUpperCase()}
      title="Your account is ready"
      description="A short introduction will show you the work available in your assigned Safira role."
      phase="Account setup"
      step={3}
      totalSteps={3}
      actions={
        <Button onClick={() => router.replace(destination)}>
          Continue to introduction
        </Button>
      }
    >
      <div className="grid gap-1.5 text-deepCharcoal">
        <span
          className="flex size-10 items-center justify-center rounded-md bg-signalYellow"
          aria-hidden="true"
        >
          <CheckCircle size={26} weight="bold" />
        </span>
        <strong className="text-base">Ready to go, {account.fullName}</strong>
        <p className="text-sm text-graphite">
          Your access is set up. Continue for a short introduction to your
          workspace.
        </p>
      </div>
      <AccountContext
        role={account.role}
        organisation={account.organisation}
        site={account.site}
      />
    </AccountFlowShell>
  );
}
