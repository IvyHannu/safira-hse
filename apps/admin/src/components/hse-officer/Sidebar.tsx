'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

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

export function HSEOfficerSidebar({ mobileOpen, onCloseMobile }: HSEOfficerSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        id="hse-officer-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-out bg-deepCharcoal border-r border-graphite md:relative md:translate-x-0 md:z-auto md:sticky md:top-0 md:h-screen',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="HSE Officer navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between gap-3 border-b border-graphite px-4">
            <span className="text-sm font-semibold text-white">Safira</span>
            <button
              type="button"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
            <ul className="grid gap-1" role="list">
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onCloseMobile}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-signalYellow text-deepCharcoal font-semibold'
                          : 'text-white/80 hover:bg-graphite hover:text-white',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow'
                      )}
                    >
                      <span aria-hidden="true" className="flex shrink-0">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-graphite p-4 md:hidden">
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:bg-graphite hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow"
            >
              <span className="flex shrink-0">
                <SignOut size={20} weight="regular" color="currentColor" />
              </span>
              Sign out
            </button>
          </div>
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

import { House, Files, ClipboardText, UserCircle, SignOut } from '@phosphor-icons/react';