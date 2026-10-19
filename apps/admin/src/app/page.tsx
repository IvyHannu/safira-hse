'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { destinationForAdminSession, isAdminRole } from '@/lib/admin-access';
import { useAuth } from '@/lib/demo-auth';

export default function AdminEntryPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(
      session && isAdminRole(session.role)
        ? destinationForAdminSession(session)
        : '/sign-in',
    );
  }, [loading, router, session]);

  return <main className="min-h-dvh bg-coolSurface" aria-hidden="true" />;
}
