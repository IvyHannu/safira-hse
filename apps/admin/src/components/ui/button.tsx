'use client';

import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';
import Link from 'next/link';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'positive-outline'
  | 'tertiary'
  | 'destructive'
  | 'destructive-outline'
  | 'destructive-tertiary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'default' | 'compact';
  loading?: boolean;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-signalYellow bg-signalYellow text-deepCharcoal hover:bg-signalYellow/90 active:bg-signalYellow/80',
  secondary:
    'border-deepCharcoal/55 bg-white text-deepCharcoal hover:border-deepCharcoal hover:bg-coolSurface active:bg-graphite/10',
  'positive-outline':
    'border-success bg-success/10 text-success hover:bg-success/15 active:bg-success/20',
  tertiary:
    'border-transparent bg-transparent text-deepCharcoal hover:bg-coolSurface active:bg-graphite/10',
  destructive:
    'border-critical bg-critical text-white hover:bg-critical/90 active:bg-critical/80',
  'destructive-outline':
    'border-critical bg-critical/5 text-critical hover:bg-critical/10 active:bg-critical/15',
  'destructive-tertiary':
    'border-critical/80 bg-critical/5 text-critical hover:border-critical hover:bg-critical/10 active:bg-critical/15',
};

const buttonBase =
  'relative inline-flex h-10 min-h-10 max-md:h-12 max-md:min-h-12 items-center justify-center gap-1 whitespace-nowrap rounded-[6px] border px-3 text-sm font-semibold leading-5 before:absolute before:-inset-y-[4px] before:inset-x-0 before:content-[""] max-md:before:inset-0 transition-[background-color,border-color,box-shadow] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-graphite/30 disabled:bg-coolSurface disabled:text-graphite/70 disabled:opacity-100';

function ButtonIcon({ icon }: { icon: ReactNode }) {
  const strongIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ size?: number; weight?: string }>, {
        size: 16,
        weight: 'bold',
      })
    : icon;

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center [&>svg]:block"
      aria-hidden="true"
    >
      {strongIcon}
    </span>
  );
}

export function Button({
  variant = 'primary',
  size = 'default',
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
      className={`${buttonBase} ${variants[variant]} ${size === 'compact' ? 'px-2.5 text-xs' : ''} ${className}`}
    >
      {loading ? (
        <span
          className="inline-flex size-4 items-center justify-center"
          aria-hidden="true"
        >
          <span className="size-3 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
        </span>
      ) : (
        icon && <ButtonIcon icon={icon} />
      )}
      <span>{children}</span>
      {loading && <span className="sr-only">Loading</span>}
    </button>
  );
}

export function ButtonLink({
  variant = 'secondary',
  size = 'default',
  icon,
  className = '',
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: 'default' | 'compact';
  icon?: ReactNode;
}) {
  return (
    <Link
      {...props}
      className={`${buttonBase} ${variants[variant]} ${size === 'compact' ? 'px-2.5 text-xs' : ''} ${className}`}
    >
      {icon && <ButtonIcon icon={icon} />}
      <span>{children}</span>
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  variant?: ButtonVariant;
}

export function IconButton({
  label,
  icon,
  variant = 'tertiary',
  className = '',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={label}
      className={`${buttonBase} size-10 max-md:size-12 shrink-0 px-0 ${variants[variant]} ${className}`}
    >
      <ButtonIcon icon={icon} />
    </button>
  );
}

export function ActionGroup({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`safira-action-group ${className}`}>{children}</div>;
}
