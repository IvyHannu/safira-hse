'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AccountBrandHeader } from '@/components/ui/account-flow-shell';
import { AccountContext } from '@/components/ui/account-context';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/feedback';
import { useAuth } from '@/lib/demo-auth';
import {
  getAdminInvitation,
  readLocalAdminAccount,
} from '@/lib/local-admin-account';

export default function AdminInvitePage() {
  const code = useSearchParams().get('code');
  const invitation = getAdminInvitation(code);
  const { loading } = useAuth();
  const existing =
    invitation && !loading ? readLocalAdminAccount(invitation.email) : null;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-coolSurface px-2 py-2 text-deepCharcoal sm:px-3 sm:py-3">
      <div className="w-full max-w-[540px]">
        <AccountBrandHeader context="ACCOUNT SETUP" compact />
        <Card className="mt-3 gap-2.5 p-2.5">
          <h1 className="text-[26px] font-bold leading-8">
            {invitation
              ? 'You’re invited to join Safira'
              : 'Invitation unavailable'}
          </h1>
          {invitation ? (
            <>
              <p className="text-sm leading-6 text-graphite">
                Your organisation has invited you to use Safira. Your assigned
                role and access are already set.
              </p>
              <AccountContext
                role={invitation.role}
                organisation={invitation.organisation}
                site={'site' in invitation ? invitation.site : undefined}
              />
              <p className="border-t border-coolConcrete pt-1.5 text-sm text-graphite">
                Invited email{' '}
                <strong className="block font-semibold text-deepCharcoal">
                  {invitation.email}
                </strong>
              </p>
              <ButtonLink
                variant="primary"
                href={
                  existing
                    ? '/sign-in'
                    : `/create-password?code=${encodeURIComponent(invitation.code)}`
                }
              >
                {existing ? 'Sign in to your account' : 'Set up your account'}
              </ButtonLink>
            </>
          ) : (
            <>
              <p className="text-sm text-graphite">
                Ask your organisation for a current Safira invitation link.
              </p>
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-deepCharcoal underline focus-visible:outline-signalYellow"
              >
                Sign in
              </Link>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
