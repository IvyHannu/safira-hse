'use client';

import type { ButtonHTMLAttributes } from 'react';
import { SignOut } from '@phosphor-icons/react';

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  surface?: 'light' | 'dark';
  busy?: boolean;
}

export function SignOutButton({
  surface = 'light',
  busy = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}: SignOutButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || busy}
      aria-busy={busy}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-1.5 text-sm font-semibold shadow-sm transition-[background-color,border-color,color,transform] hover:border-signalYellow active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${
        surface === 'dark'
          ? 'border-coolConcrete/40 bg-transparent text-white hover:bg-graphite active:bg-graphite/80'
          : 'border-deepCharcoal bg-deepCharcoal text-white hover:bg-graphite active:bg-deepCharcoal'
      } ${className}`}
    >
      <SignOut
        size={18}
        weight="bold"
        aria-hidden="true"
        className={surface === 'light' ? 'text-signalYellow' : undefined}
      />
      <span>{busy ? 'Signing out…' : 'Sign out'}</span>
    </button>
  );
}
