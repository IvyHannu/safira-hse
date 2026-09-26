'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant =
  'primary' | 'secondary' | 'tertiary' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-signalYellow bg-signalYellow text-graphite hover:bg-coolSurface',
  secondary: 'border-graphite bg-white text-graphite hover:bg-coolSurface',
  tertiary:
    'border-transparent bg-transparent text-graphite hover:bg-coolSurface',
  destructive:
    'border-critical bg-critical text-white hover:bg-white hover:text-critical',
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-2 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        />
      ) : (
        icon
      )}
      <span>{children}</span>
      {loading && <span className="sr-only">Loading</span>}
    </button>
  );
}
