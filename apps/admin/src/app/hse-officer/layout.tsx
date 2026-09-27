'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { HSEOfficerSidebar } from '@/components/hse-officer/Sidebar';
import { MobileHeader } from '@/components/ui/shell';

export default function HSEOfficerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-coolSurface">
      <HSEOfficerSidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      <MobileHeader title="Safira" onMenuClick={() => setMobileMenuOpen(true)} />
      <main className="flex-1 min-w-0 lg:pl-0 pt-12 md:pt-0">
        <div className="h-full lg:h-screen lg:overflow-y-auto">
          <div className="mx-auto w-full max-w-[1120px] px-4 py-3 lg:px-6 lg:py-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}