'use client';

import { useState, type ButtonHTMLAttributes } from 'react';
import { SignOut } from '@phosphor-icons/react';
import { colors } from '@safira/design-tokens';

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
  onFocus,
  onBlur,
  style,
  ...props
}: SignOutButtonProps) {
  const [focused, setFocused] = useState(false);

  return (
    <button
      {...props}
      type={type}
      data-surface={surface}
      disabled={disabled || busy}
      aria-busy={busy}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={{
        ...style,
        backgroundColor: colors.deepCharcoal,
        borderColor: focused ? colors.signalYellow : colors.deepCharcoal,
        color: colors.white,
        opacity: 1,
        outline: 'none',
      }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-1.5 text-sm font-semibold shadow-sm transition-transform active:scale-[0.98] disabled:cursor-not-allowed motion-reduce:transition-none ${className}`}
    >
      <SignOut
        size={18}
        weight="bold"
        aria-hidden="true"
        style={{ color: colors.signalYellow, opacity: 1 }}
      />
      <span style={{ color: colors.white, opacity: 1 }}>Sign out</span>
    </button>
  );
}
