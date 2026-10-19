'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  House,
  FileText,
  ClipboardText,
  MapPin,
  Gear,
  ChartBar,
  List,
  X,
} from '@phosphor-icons/react';
import { SidebarAccount } from '@/components/ui/sidebar-account';
import { AdminSidebarNav } from '@/components/ui/admin-sidebar-nav';
import { SafiraSidebarLockup } from '@/components/ui/safira-sidebar-lockup';
import { TopbarShell } from '@/components/ui/shell';
import { useAuth } from '@/lib/demo-auth';
import { adminProfile } from '@/data/admin-profile';

const navigation = [
  { label: 'Overview', icon: House, href: '/hse-admin/overview' },
  { label: 'Reports', icon: FileText, href: '/hse-admin/reports' },
  { label: 'Checklists', icon: ClipboardText, href: '/hse-admin/checklists' },
  { label: 'Sites', icon: MapPin, href: '/hse-admin/sites' },
  { label: 'Configuration', icon: Gear, href: '/hse-admin/configuration' },
  { label: 'Reports & Insights', icon: ChartBar, href: '/hse-admin/insights' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { session, account, loading, signOut, error } = useAuth();
  const router = useRouter();
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!loading && session?.role !== 'hse_admin')
      router.replace(signingOut ? '/sign-in' : '/workspace');
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
          <SafiraSidebarLockup context="HSE ADMIN" />
          <button
            className="admin-close"
            aria-label="Close navigation menu"
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        <AdminSidebarNav
          label="HSE Admin main navigation"
          items={navigation.map(({ icon: Icon, ...item }) => ({
            ...item,
            icon: <Icon size={20} aria-hidden="true" />,
          }))}
          onNavigate={close}
        />
        <SidebarAccount
          name={account?.fullName || adminProfile.name}
          role="HSE Admin"
          workspace="HSE administration"
          profileHref="/hse-admin/profile"
          onNavigate={close}
          busy={signingOut && !error}
          error={error}
          onSignOut={() => {
            setSigningOut(true);
            void signOut();
          }}
        />
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
