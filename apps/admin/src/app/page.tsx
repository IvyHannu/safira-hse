'use client';

import { useRouter } from 'next/navigation';
import type { AuthRole } from '@safira/auth';
import { useAuth } from '@/lib/demo-auth';
import { Button } from '@/components/ui';

const roles: { value: AuthRole; label: string; detail: string }[] = [
  { value: 'worker', label: 'Worker', detail: 'Open the Worker app' },
  {
    value: 'hse_officer',
    label: 'HSE Officer',
    detail: 'Review work for permitted sites',
  },
  {
    value: 'hse_admin',
    label: 'HSE Admin',
    detail: 'Open the HSE admin space',
  },
  {
    value: 'organisation_admin',
    label: 'Organisation Admin',
    detail: 'Open the organisation admin space',
  },
];

export default function Home() {
  const router = useRouter();
  const { session, loading, error, signIn, signOut } = useAuth();

  async function chooseRole(role: AuthRole) {
    if (role === 'worker') {
      if (!(await signIn(role))) return;
      const base =
        process.env.NEXT_PUBLIC_WORKER_DEMO_URL || 'http://localhost:8081';
      window.open(`${base.replace(/\/$/, '')}/?workspaceRole=worker`, '_self');
      return;
    }
    if (await signIn(role)) router.push('/workspace');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-coolSurface px-4 py-8 text-graphite">
      <section className="w-full max-w-[480px] border border-coolConcrete bg-white p-6 sm:p-8">
        <div className="mb-7 border-l-4 border-signalYellow pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">
            Safira
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-8 text-deepCharcoal">
            Choose your workspace
          </h1>
          <p className="mt-2 text-sm leading-6">
            Continue as the role that matches your work.
          </p>
        </div>
        {loading ? (
          <p role="status">Opening Safira…</p>
        ) : (
          <div className="grid gap-3">
            {roles.map(({ value, label, detail }) => (
              <div key={value} className="grid gap-1">
                <Button
                  variant={session?.role === value ? 'primary' : 'secondary'}
                  aria-pressed={session?.role === value}
                  onClick={() => void chooseRole(value)}
                  className="w-full justify-start"
                >
                  {label}
                </Button>
                <p className="px-1 text-xs text-graphite">{detail}</p>
              </div>
            ))}
            {session && (
              <Button
                variant="tertiary"
                onClick={() => void signOut()}
                className="mt-2 justify-start"
              >
                Sign out
              </Button>
            )}
          </div>
        )}
        {error && (
          <p className="mt-4 text-sm font-semibold text-critical" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
