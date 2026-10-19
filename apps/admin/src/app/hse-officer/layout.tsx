'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { colors } from '@safira/design-tokens';
import { HSEOfficerSidebar } from '@/components/hse-officer/Sidebar';
import { MobileHeader } from '@/components/ui/shell';
import { useAuth } from '@/lib/demo-auth';
import {
  hasCompletedHseOfficerOnboarding,
  subscribeHseOfficerOnboarding,
} from '@/lib/hse-officer-onboarding';
import './officer.css';

export default function HSEOfficerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session, account, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isOfficer = session?.role === 'hse_officer';
  const isOnboarding = pathname.startsWith('/hse-officer/onboarding');
  const isPreview =
    process.env.NODE_ENV === 'development' &&
    pathname === '/hse-officer/onboarding/preview';
  const onboardingComplete = useSyncExternalStore(
    subscribeHseOfficerOnboarding,
    () => (session ? hasCompletedHseOfficerOnboarding(session) : false),
    () => false,
  );

  useEffect(() => {
    if (loading) return;
    if (!isOfficer) {
      router.replace('/sign-in');
      return;
    }
    if (account && !account.profileComplete) {
      router.replace('/complete-profile');
      return;
    }
    if (!onboardingComplete && !isOnboarding)
      router.replace('/hse-officer/onboarding');
    if (onboardingComplete && isOnboarding && !isPreview)
      router.replace('/hse-officer/overview');
  }, [
    account,
    isOfficer,
    isOnboarding,
    isPreview,
    loading,
    onboardingComplete,
    router,
  ]);

  const redirecting = isOfficer
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

  return (
    <div
      className="officer-ui flex bg-coolSurface"
      style={
        Object.fromEntries(
          Object.entries({
            graphite: colors.graphite,
            charcoal: colors.deepCharcoal,
            yellow: colors.signalYellow,
            surface: colors.coolSurface,
            information: colors.information,
            critical: colors.critical,
            warning: colors.warning,
            success: colors.success,
          }).map(([name, value]) => [`--officer-${name}`, value]),
        ) as CSSProperties
      }
    >
      <HSEOfficerSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <MobileHeader
        title="Safira"
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      <main className="w-full md:flex-1 min-w-0 min-h-0 pt-12 md:pt-0">
        <div className="officer-content">
          <div className="officer-page">{children}</div>
        </div>
      </main>
    </div>
  );
}
