'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuthRole } from '@safira/auth';
import { useAuth } from '@/lib/demo-auth';

const adminRoles: Record<Exclude<AuthRole, 'worker'>, string> = {
  hse_officer: 'HSE Officer',
  hse_admin: 'HSE Admin',
  organisation_admin: 'Organisation Admin',
};

export default function WorkspacePage() {
  const router = useRouter();
  const { session, loading, error, signIn } = useAuth();
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

  if (role === 'hse_admin') {
    router.replace('/hse-admin/overview');
    return null;
  }

  if (role === 'hse_officer') {
    router.replace('/hse-officer/overview');
    return null;
  }

  if (role === 'organisation_admin') {
    router.replace('/organisation-admin/overview');
    return null;
  }

  return null;
}
