'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useOfficerLayer } from './ui';
import safiraMark from '../../../../../docs/references/brand/Safira Mark.png';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const items: SidebarItem[] = [
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
  {
    href: '/hse-officer/profile',
    label: 'Profile',
    icon: <UserCircle size={20} weight="regular" color="currentColor" />,
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
  const pathname = usePathname();
  useOfficerLayer(mobileOpen, onCloseMobile);

  return (
    <>
      <aside
        id="hse-officer-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 h-dvh shrink-0 transform transition-transform duration-200 ease-out bg-deepCharcoal border-r border-graphite md:relative md:translate-x-0 md:z-auto',
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
          <div className="flex h-14 items-center justify-between gap-3 border-b border-graphite px-4">
            <Image
              src={safiraMark}
              alt="Safira"
              width={36}
              height={36}
              priority
            />
            <button
              type="button"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <nav
            className="flex-1 overflow-y-auto px-3 py-3"
            aria-label="Main navigation"
          >
            <ul className="grid gap-1" role="list">
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex h-11 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-signalYellow text-deepCharcoal font-semibold'
                          : 'text-white/90 hover:bg-graphite hover:text-white',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-5 shrink-0 items-center justify-center"
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
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

import { House, Files, ClipboardText, UserCircle } from '@phosphor-icons/react';
