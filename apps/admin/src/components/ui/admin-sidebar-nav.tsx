'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './admin-sidebar-nav.css';

export interface AdminSidebarItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export function AdminSidebarNav({
  items,
  label,
  onNavigate,
}: {
  items: AdminSidebarItem[];
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="safira-admin-sidebar-nav" aria-label={label}>
      <ul>
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className="safira-admin-sidebar-nav-icon"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
