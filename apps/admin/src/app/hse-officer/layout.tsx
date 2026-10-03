'use client';

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { colors } from '@safira/design-tokens';
import { HSEOfficerSidebar } from '@/components/hse-officer/Sidebar';
import { MobileHeader } from '@/components/ui/shell';
import './officer.css';

export default function HSEOfficerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
