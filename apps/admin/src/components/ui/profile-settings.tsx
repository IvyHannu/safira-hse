'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { CaretRight } from '@phosphor-icons/react';

export function ProfileAvatar({
  name,
  photoUrl,
  className = '',
}: {
  name: string;
  photoUrl?: string | null;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?';

  return (
    <span
      role="img"
      aria-label={`${name} avatar`}
      className={`relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-coolSurface text-xl font-bold text-deepCharcoal ${className}`}
      style={{ width: 64, height: 64, borderRadius: '50%' }}
    >
      {photoUrl && photoUrl !== failedUrl ? (
        <Image
          src={photoUrl}
          alt=""
          fill
          unoptimized
          sizes="64px"
          className="object-cover"
          onError={() => setFailedUrl(photoUrl)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

export function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 border-b border-graphite/10 py-2.5 last:border-0">
      <span className="min-w-0">
        <strong className="block text-sm font-semibold text-deepCharcoal">
          {label}
        </strong>
        <small className="mt-0.5 block text-xs leading-5 text-graphite/75">
          {description}
        </small>
      </span>
      <span className="relative flex h-[22px] w-[40px] shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0"
        />
        <span
          className={`h-[22px] w-[40px] rounded-full border transition-colors motion-reduce:transition-none ${checked ? 'border-deepCharcoal bg-deepCharcoal' : 'border-graphite/35 bg-coolSurface'} peer-focus-visible:border-signalYellow`}
          style={{ width: 40, height: 22, borderRadius: 9999 }}
        />
        <span
          className="pointer-events-none absolute bg-white shadow-sm transition-transform motion-reduce:transition-none"
          style={{
            left: 3,
            top: 3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            transform: checked ? 'translateX(18px)' : 'none',
          }}
        />
      </span>
    </label>
  );
}

export function DisclosureRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <details className="group border-b border-graphite/10 last:border-0">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-sm py-3 text-sm font-semibold text-deepCharcoal transition-colors hover:bg-coolSurface active:bg-coolConcrete focus-visible:outline focus-visible:outline-2 focus-visible:outline-signalYellow [&::-webkit-details-marker]:hidden">
        {label}
        <CaretRight
          size={18}
          weight="bold"
          aria-hidden="true"
          className="shrink-0 text-graphite transition-transform group-open:rotate-90 motion-reduce:transition-none"
        />
      </summary>
      <div className="pb-3 text-sm leading-6 text-graphite">{children}</div>
    </details>
  );
}

export function ProfileCard({
  as: Element = 'section',
  className = '',
  children,
  ...props
}: {
  as?: 'section' | 'aside';
  className?: string;
  children: ReactNode;
  id?: string;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}) {
  return (
    <Element
      {...props}
      className={`min-w-0 rounded-lg border border-graphite/15 bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </Element>
  );
}
