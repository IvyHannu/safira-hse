'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuthRole } from '@safira/auth';
import { useAuth } from '@/lib/demo-auth';
import { Button } from '@/components/ui';

const adminRoles: Record<Exclude<AuthRole, 'worker'>, string> = {
  hse_officer: 'HSE Officer',
  hse_admin: 'HSE Admin',
  organisation_admin: 'Organisation Admin',
};

export default function WorkspacePage() {
  const router = useRouter();
  const { session, loading, error, signIn, signOut } = useAuth();
  const [acceptingLink, setAcceptingLink] = useState(true);
  const linkHandled = useRef(false);

  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get(
      'workspaceRole',
    );
    if (role && role in adminRoles) {
      if (linkHandled.current) return;
      linkHandled.current = true;
      void signIn(role as Exclude<AuthRole, 'worker'>).then((saved) => {
        setAcceptingLink(false);
        if (saved) router.replace('/workspace');
      });
    } else {
      const timer = setTimeout(() => setAcceptingLink(false), 0);
      return () => clearTimeout(timer);
    }
  }, [router, signIn]);

  if (loading || acceptingLink)
    return (
      <main className="min-h-screen bg-coolSurface p-6" role="status">
        Opening Safira…
      </main>
    );
  const role = session?.role;
  if (!role || role === 'worker') {
    return (
      <main className="min-h-screen bg-coolSurface p-6 text-graphite">
        <p>Choose your workspace to continue.</p>
        <Link href="/" className="mt-4 inline-block underline">
          Choose workspace
        </Link>
        {error && (
          <p role="alert" className="text-critical">
            {error}
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-coolSurface p-6 text-graphite">
      <section className="mx-auto max-w-[720px] border border-coolConcrete bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          Safira Admin
        </p>
        <h1 className="mt-3 border-l-4 border-signalYellow pl-4 text-[22px] font-semibold text-deepCharcoal">
          {adminRoles[role]} space
        </h1>
        <Button
          className="mt-6"
          variant="secondary"
          onClick={() => router.push('/')}
        >
          Switch workspace
        </Button>
        <Button
          className="mt-6"
          variant="tertiary"
          onClick={() => void signOut().then(() => router.replace('/'))}
        >
          Sign out
        </Button>
      </section>
    </main>
  );
}
