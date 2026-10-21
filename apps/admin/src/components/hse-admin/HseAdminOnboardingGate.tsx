'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminShell } from './AdminShell';
import { useAuth } from '@/lib/demo-auth';
import {
  hasCompletedHseAdminOnboarding,
  subscribeHseAdminOnboarding,
} from '@/lib/hse-admin-onboarding';

export function HseAdminOnboardingGate({ children }: { children: ReactNode }) {
  const { session, account, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isHseAdmin = session?.role === 'hse_admin';
  const isOnboarding = pathname.startsWith('/hse-admin/onboarding');
  const isPreview =
    process.env.NODE_ENV === 'development' &&
    pathname === '/hse-admin/onboarding/preview';
  const onboardingComplete = useSyncExternalStore(
    subscribeHseAdminOnboarding,
    () => (session ? hasCompletedHseAdminOnboarding(session) : false),
    () => false,
  );

  useEffect(() => {
    if (loading) return;
    if (!isHseAdmin) {
      router.replace('/sign-in');
      return;
    }
    if (account && !account.profileComplete) {
      router.replace('/complete-profile');
      return;
    }
    if (!onboardingComplete && !isOnboarding)
      router.replace('/hse-admin/onboarding');
    if (onboardingComplete && isOnboarding && !isPreview)
      router.replace('/hse-admin/overview');
  }, [
    account,
    isHseAdmin,
    isOnboarding,
    isPreview,
    loading,
    onboardingComplete,
    router,
  ]);

  const redirecting = isHseAdmin
    ? (account && !account.profileComplete) ||
      (onboardingComplete === isOnboarding && !isPreview)
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

  return <AdminShell>{children}</AdminShell>;
}
