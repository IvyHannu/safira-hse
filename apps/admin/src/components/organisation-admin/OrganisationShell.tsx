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
  Buildings,
  House,
  List,
  MapPin,
  ShieldCheck,
  Users,
  X,
} from '@phosphor-icons/react';
import { SidebarAccount } from '@/components/ui/sidebar-account';
import { AdminSidebarNav } from '@/components/ui/admin-sidebar-nav';
import { SafiraSidebarLockup } from '@/components/ui/safira-sidebar-lockup';
import { TopbarShell } from '@/components/ui/shell';
import { useAuth } from '@/lib/demo-auth';
import { adminProfile } from '@/data/admin-profile';

const navigation = [
  { label: 'Overview', icon: House, href: '/organisation-admin/overview' },
  { label: 'Users & Roles', icon: Users, href: '/organisation-admin/users' },
  {
    label: 'Sites & Work Areas',
    icon: MapPin,
    href: '/organisation-admin/sites',
  },
  {
    label: 'Organisation',
    icon: Buildings,
    href: '/organisation-admin/organisation',
  },
  {
    label: 'Access / Permissions',
    icon: ShieldCheck,
    href: '/organisation-admin/access',
  },
];

export function OrganisationShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { session, account, loading, signOut, error } = useAuth();
  const router = useRouter();
  const sidebar = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!loading && session?.role !== 'organisation_admin')
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
        const items = controls();
        const first = items[0],
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

  if (loading || session?.role !== 'organisation_admin')
    return (
      <main className="p-6" role="status">
        Opening Safira…
      </main>
    );

  return (
    <div className="organisation-shell">
      {open && (
        <button
          className="organisation-backdrop"
          aria-label="Close navigation backdrop"
          onClick={close}
        />
      )}
      <aside
        ref={sidebar}
        id="organisation-navigation"
        className={`organisation-sidebar ${open ? 'is-open' : ''}`}
        role={open ? 'dialog' : undefined}
        aria-modal={open || undefined}
        aria-label="Organisation Admin navigation"
      >
        <div className="organisation-brand">
          <SafiraSidebarLockup context="ORGANISATION ADMIN" />
          <button
            className="organisation-close"
            aria-label="Close navigation menu"
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        <AdminSidebarNav
          label="Organisation Admin main navigation"
          items={navigation.map(({ icon: Icon, ...item }) => ({
            ...item,
            icon: <Icon size={20} aria-hidden="true" />,
          }))}
          onNavigate={close}
        />
        <SidebarAccount
          name={account?.fullName || adminProfile.name}
          role="Organisation Admin"
          workspace="Organisation governance"
          profileHref="/organisation-admin/profile"
          onNavigate={close}
          busy={signingOut && !error}
          error={error}
          onSignOut={() => {
            setSigningOut(true);
            void signOut();
          }}
        />
      </aside>
      <div className="organisation-workspace">
        <div className="organisation-topbar">
          <button
            className="organisation-menu"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="organisation-navigation"
            onClick={() => setOpen(true)}
          >
            <List size={22} />
          </button>
          <TopbarShell
            brand="Organisation Admin"
            actions={
              <div className="organisation-topbar-identity">
                <span aria-hidden="true">OA</span>
                <strong>Organisation Admin</strong>
              </div>
            }
          />
        </div>
        <main className="organisation-content" inert={open || undefined}>
          <div className="organisation-page">{children}</div>
        </main>
      </div>
    </div>
  );
}
