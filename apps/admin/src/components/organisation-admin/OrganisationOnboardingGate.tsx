'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { OrganisationShell } from './OrganisationShell';
import { useAuth } from '@/lib/demo-auth';
import {
  hasCompletedOrganisationAdminOnboarding,
  subscribeOrganisationAdminOnboarding,
} from '@/lib/organisation-admin-onboarding';

export function OrganisationOnboardingGate({
  children,
}: {
  children: ReactNode;
}) {
  const { session, account, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isOrganisationAdmin = session?.role === 'organisation_admin';
  const isOnboarding = pathname === '/organisation-admin/onboarding';
  const onboardingComplete = useSyncExternalStore(
    subscribeOrganisationAdminOnboarding,
    () => (session ? hasCompletedOrganisationAdminOnboarding(session) : false),
    () => false,
  );

  useEffect(() => {
    if (loading) return;
    if (!isOrganisationAdmin) {
      router.replace('/sign-in');
      return;
    }
    if (account && !account.profileComplete) {
      router.replace('/complete-profile');
      return;
    }
    if (!onboardingComplete && !isOnboarding)
      router.replace('/organisation-admin/onboarding');
    if (onboardingComplete && isOnboarding)
      router.replace('/organisation-admin/overview');
  }, [
    account,
    isOrganisationAdmin,
    isOnboarding,
    loading,
    onboardingComplete,
    router,
  ]);

  const redirecting = isOrganisationAdmin
    ? (account && !account.profileComplete) ||
      onboardingComplete === isOnboarding
    : true;
  if (loading || redirecting)
    return (
      <main
        className="min-h-dvh bg-coolSurface p-6 text-graphite"
        role="status"
      >
        Opening Safira…
      </main>
    );
  if (isOnboarding) return <>{children}</>;

  return <OrganisationShell>{children}</OrganisationShell>;
}
