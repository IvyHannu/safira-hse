'use client';

import type { AuthRole } from '@safira/auth';
import { useAuth } from '@/lib/demo-auth';

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
    <main className="flex min-h-screen items-center justify-center bg-warmBone p-4 text-graphite">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Safira Admin</h1>
        <p className="mt-2 text-sm">
          Development access only. Choose a role to explore the prototype.
        </p>
        {loading ? (
          <p className="mt-6" role="status">
            Restoring demo session…
          </p>
        ) : (
          <>
            <p className="mt-6 font-semibold" role="status">
              {activeLabel ? `Signed in as ${activeLabel}` : 'Signed out'}
            </p>
            <div className="mt-4 grid gap-2" aria-label="Demo roles">
              {roles.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={session?.role === value}
                  onClick={() => void signIn(value)}
                  className="rounded-md border border-graphite px-4 py-3 text-left font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite aria-pressed:bg-saffron"
                >
                  {label}
                </button>
              ))}
            </div>
            {session && (
              <button
                type="button"
                onClick={() => void signOut()}
                className="mt-4 rounded-md px-4 py-3 text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite"
              >
                Sign out
              </button>
            )}
          </>
        )}
        {error && (
          <p className="mt-4 text-critical" role="alert">
            {error}
          </p>
        )}
        <p className="mt-6 text-xs">
          Demo roles are local UI state and do not grant database access.
        </p>
        {process.env.NODE_ENV !== 'production' && (
          <a
            href="/design-system"
            className="mt-2 inline-flex min-h-10 items-center rounded-md text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
          >
            Open design system showcase
          </a>
        )}
      </section>
    </main>
  );
}
