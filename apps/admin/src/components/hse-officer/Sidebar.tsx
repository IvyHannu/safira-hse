'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { SafiraSidebarLockup } from '@/components/ui/safira-sidebar-lockup';
import { SidebarAccount } from '@/components/ui/sidebar-account';
import {
  AdminSidebarNav,
  type AdminSidebarItem,
} from '@/components/ui/admin-sidebar-nav';
import { useAuth } from '@/lib/demo-auth';
import { officerProfile } from '@/data/officer-profile';
import { useOfficerLayer } from './ui';

const items: AdminSidebarItem[] = [
  {
    href: '/hse-officer/overview',
    label: 'Overview',
    icon: <House size={20} weight="regular" color="currentColor" />,
  },
  {
    href: '/hse-officer/reports',
    label: 'Reports',
    icon: <Files size={20} weight="regular" color="currentColor" />,
  },
  {
    href: '/hse-officer/checklists',
    label: 'Checklists',
    icon: <ClipboardText size={20} weight="regular" color="currentColor" />,
  },
];

interface HSEOfficerSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function HSEOfficerSidebar({
  mobileOpen,
  onCloseMobile,
}: HSEOfficerSidebarProps) {
  const router = useRouter();
  const { session, signOut, error } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  useOfficerLayer(mobileOpen, onCloseMobile);

  useEffect(() => {
    if (signingOut && !session && !error) router.replace('/');
  }, [signingOut, session, error, router]);

  return (
    <>
      <aside
        id="hse-officer-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[280px] h-dvh shrink-0 transform transition-transform duration-200 ease-out bg-deepCharcoal border-r border-graphite md:relative md:w-[240px] md:translate-x-0 md:z-auto',
          mobileOpen
            ? 'translate-x-0 visible'
            : '-translate-x-full invisible md:visible',
        )}
        aria-label="HSE Officer navigation"
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen || undefined}
        data-officer-dialog={mobileOpen ? '' : undefined}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[144px] shrink-0 items-center justify-between gap-3 border-b border-graphite px-4">
            <SafiraSidebarLockup context="HSE OFFICER" />
            <button
              type="button"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <AdminSidebarNav
            label="HSE Officer main navigation"
            items={items}
            onNavigate={onCloseMobile}
          />
          <SidebarAccount
            name={officerProfile.name}
            role="HSE Officer"
            workspace="HSE review"
            profileHref="/hse-officer/profile"
            onNavigate={onCloseMobile}
            busy={signingOut && !error}
            error={error}
            onSignOut={() => {
              setSigningOut(true);
              void signOut();
            }}
          />
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-deepCharcoal/80 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
    </>
  );
}

import { House, Files, ClipboardText } from '@phosphor-icons/react';
