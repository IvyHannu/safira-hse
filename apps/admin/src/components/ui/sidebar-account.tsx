'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import {
  CaretDown,
  SignOut,
  UserCircle,
} from '@phosphor-icons/react';
import './sidebar-account.css';

interface SidebarAccountProps {
  name: string;
  role: string;
  workspace: string;
  profileHref: string;
  onSignOut: () => void;
  onNavigate?: () => void;
  busy?: boolean;
  error?: string | null;
}

export function SidebarAccount({
  name,
  role,
  workspace,
  profileHref,
  onSignOut,
  onNavigate,
  busy = false,
  error,
}: SidebarAccountProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const menuId = useId();
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?';

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  function navigate() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div className="safira-sidebar-account" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="safira-sidebar-account-trigger"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="safira-sidebar-account-avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="safira-sidebar-account-copy">
          <strong>{name}</strong>
          <small title={workspace}>{role}</small>
        </span>
        <CaretDown size={16} weight="bold" aria-hidden="true" />
      </button>
      {open && (
        <div
          id={menuId}
          className="safira-sidebar-account-popover"
          aria-label="Account actions"
        >
          <Link ref={firstItemRef} href={profileHref} onClick={navigate}>
            <UserCircle size={18} aria-hidden="true" />
            Profile
          </Link>
          <button type="button" disabled={busy} onClick={onSignOut}>
            <SignOut size={18} aria-hidden="true" />
            Sign out
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
}
