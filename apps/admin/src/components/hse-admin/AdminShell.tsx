'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  House,
  FileText,
  ClipboardText,
  MapPin,
  Gear,
  ChartBar,
  UserCircle,
  List,
  X,
} from '@phosphor-icons/react';
import { SignOutButton } from '@/components/ui/sign-out-button';
import { SafiraSidebarLockup } from '@/components/ui/safira-sidebar-lockup';
import { TopbarShell } from '@/components/ui/shell';
import { useAuth } from '@/lib/demo-auth';

const navigation = [
  { label: 'Overview', icon: House, href: '/hse-admin/overview' },
  { label: 'Reports', icon: FileText, href: '/hse-admin/reports' },
  { label: 'Checklists', icon: ClipboardText, href: '/hse-admin/checklists' },
  { label: 'Sites', icon: MapPin, href: '/hse-admin/sites' },
  { label: 'Configuration', icon: Gear, href: '/hse-admin/configuration' },
  { label: 'Reports & Insights', icon: ChartBar, href: '/hse-admin/insights' },
  { label: 'Profile', icon: UserCircle, href: '/hse-admin/profile' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { session, loading, signOut, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!loading && session?.role !== 'hse_admin')
      router.replace(signingOut ? '/' : '/workspace');
  }, [loading, session, router, signingOut]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const controls = () =>
      Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not(:disabled)',
        ) || [],
      ).filter((element) => element.getClientRects().length);
    controls()[0]?.focus();
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
      if (event.key === 'Tab') {
        const items = controls(),
          first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    function resize() {
      if (window.matchMedia('(min-width: 768px)').matches) close();
    }
    window.addEventListener('keydown', keyboard);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('keydown', keyboard);
      window.removeEventListener('resize', resize);
      previous?.focus();
    };
  }, [open, close]);
  if (loading || session?.role !== 'hse_admin')
    return (
      <main className="p-6" role="status">
        Opening Safira…
      </main>
    );
  return (
    <div className="hse-admin-shell">
      {open && (
        <button
          aria-label="Close navigation backdrop"
          className="admin-backdrop"
          onClick={close}
        />
      )}
      <aside
        ref={sidebar}
        id="hse-admin-navigation"
        className={`admin-sidebar ${open ? 'is-open' : ''}`}
        role={open ? 'dialog' : undefined}
        aria-modal={open || undefined}
        aria-label="HSE Admin navigation"
      >
        <div className="admin-brand">
          <SafiraSidebarLockup />
          <button
            className="admin-close"
            aria-label="Close navigation menu"
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        <nav aria-label="HSE Admin main navigation">
          <ul>
            {navigation.map(({ label, icon: Icon, ...item }) => (
              <li key={label}>
                {'href' in item && item.href ? (
                  <Link
                    href={item.href}
                    aria-current={
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                        ? 'page'
                        : undefined
                    }
                    onClick={close}
                  >
                    <Icon size={20} aria-hidden="true" />
                    {label}
                  </Link>
                ) : (
                  <button disabled title={`${label} is not available yet`}>
                    <Icon size={20} aria-hidden="true" />
                    {label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="admin-sidebar-footer">
          <p className="text-sm font-semibold">HSE Admin</p>
          <p className="text-xs text-white/60">HSE administration</p>
          <SignOutButton
            surface="dark"
            className="admin-signout w-full"
            disabled={signingOut && !error}
            onClick={() => {
              setSigningOut(true);
              void signOut();
            }}
            busy={signingOut && !error}
          />
          {error && (
            <p role="alert" className="text-xs">
              {error}
            </p>
          )}
        </div>
      </aside>
      <div className="admin-workspace">
        <div className="admin-topbar">
          <button
            ref={menuButton}
            className="admin-menu"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="hse-admin-navigation"
            onClick={() => setOpen(true)}
          >
            <List size={22} />
          </button>
          <TopbarShell
            brand="HSE Admin Portal"
            actions={
              <div className="flex items-center gap-2">
                <span className="admin-avatar" aria-hidden="true">
                  AD
                </span>
                <span className="text-xs font-semibold">HSE Admin</span>
              </div>
            }
          />
        </div>
        <main className="admin-content" inert={open || undefined}>
          <div className="admin-page">{children}</div>
        </main>
      </div>
    </div>
  );
}
