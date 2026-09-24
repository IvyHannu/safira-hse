'use client';

import type { AuthRole } from '@safira/auth';
import { useAuth } from '@/lib/demo-auth';
import { Button, PageContainer } from '@/components/ui';

const roles: { value: AuthRole; label: string }[] = [
  { value: 'worker', label: 'Worker' },
  { value: 'hse_officer', label: 'HSE Officer' },
  { value: 'hse_admin', label: 'HSE Admin' },
  { value: 'organisation_admin', label: 'Organisation Admin' },
];

export default function Home() {
  const { session, loading, error, signIn, signOut } = useAuth();
  const activeLabel = roles.find((role) => role.value === session?.role)?.label;

  return (
    <main className="flex min-h-screen items-start justify-center bg-warmBone py-6 text-graphite">
      <PageContainer narrow>
        <section className="grid gap-4 rounded-lg bg-white p-5 shadow-sm">
          <div className="grid gap-1">
            <h1 className="text-[22px] font-semibold leading-7">Safira Admin</h1>
            <p className="text-sm leading-6">
              Development access only. Choose a role to explore the prototype.
            </p>
          </div>
        {loading ? (
          <p className="mt-6" role="status">
            Restoring demo session…
          </p>
        ) : (
          <>
            <p className="text-sm font-semibold" role="status">
              {activeLabel ? `Signed in as ${activeLabel}` : 'Signed out'}
            </p>
            <div className="grid gap-2" aria-label="Demo roles">
              {roles.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={session?.role === value ? 'primary' : 'secondary'}
                  aria-pressed={session?.role === value}
                  onClick={() => void signIn(value)}
                  className="justify-start"
                >
                  {label}
                </Button>
              ))}
            </div>
            {session && (
              <Button variant="tertiary" onClick={() => void signOut()} className="justify-start px-0">
                Sign out
              </Button>
            )}
          </>
        )}
        {error && (
          <p className="text-sm font-semibold text-critical" role="alert">
            {error}
          </p>
        )}
        <p className="text-xs leading-5">
          Demo roles are local UI state and do not grant database access.
        </p>
        {process.env.NODE_ENV !== 'production' && (
          <a
            href="/design-system"
            className="inline-flex h-9 items-center text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
          >
            Open design system showcase
          </a>
        )}
        </section>
      </PageContainer>
    </main>
  );
}
