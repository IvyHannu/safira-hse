'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HSEOfficerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/hse-officer/overview');
  }, [router]);

  return null;
}