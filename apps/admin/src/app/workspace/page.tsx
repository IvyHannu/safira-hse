'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/demo-auth';
import { destinationForAdminSession, isAdminRole } from '@/lib/admin-access';

export default function WorkspacePage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (session && isAdminRole(session.role))
      router.replace(destinationForAdminSession(session));
    else router.replace('/sign-in');
  }, [loading, session, router]);

  return <main className="min-h-dvh bg-coolSurface" aria-hidden="true" />;
}
