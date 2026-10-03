'use client';

import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

export type ButtonVariant =
  'primary' | 'secondary' | 'tertiary' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-signalYellow bg-signalYellow text-deepCharcoal hover:bg-signalYellow/90 active:bg-signalYellow/80',
  secondary:
    'border-deepCharcoal/35 bg-white text-deepCharcoal hover:bg-coolSurface active:bg-graphite/10',
  tertiary:
    'border-transparent bg-transparent text-deepCharcoal hover:bg-coolSurface active:bg-graphite/10',
  destructive:
    'border-critical bg-critical text-white hover:bg-critical/90 active:bg-critical/80',
};

const buttonBase =
  'inline-flex h-11 min-h-11 items-center justify-center gap-1 whitespace-nowrap rounded-md border px-4 text-sm font-semibold leading-5 transition-[background-color,border-color,color,box-shadow] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-graphite/30 disabled:bg-coolSurface disabled:text-graphite/70 disabled:opacity-100';

function ButtonIcon({ icon }: { icon: ReactNode }) {
  const strongIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ size?: number; weight?: string }>, {
        size: 18,
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
      className={`${buttonBase} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span
          className="inline-flex size-[18px] items-center justify-center"
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
      className={`${buttonBase} size-11 shrink-0 px-0 ${variants[variant]} ${className}`}
    >
      <ButtonIcon icon={icon} />
    </button>
  );
}
