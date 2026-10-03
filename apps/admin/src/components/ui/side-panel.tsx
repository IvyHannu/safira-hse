'use client';

import type { FormEvent, ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import { useOfficerLayer } from '@/components/hse-officer/ui';
import { IconButton } from './button';

interface SidePanelProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footer: ReactNode;
}

export function SidePanel({
  open,
  title,
  onClose,
  onSubmit,
  children,
  footer,
}: SidePanelProps) {
  useOfficerLayer(open, onClose);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-deepCharcoal/70"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-officer-dialog
        className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-lg flex-col bg-white shadow-xl md:w-2/3 lg:max-w-2xl"
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-graphite/20 px-4">
          <h2 className="text-base font-semibold text-deepCharcoal">{title}</h2>
          <IconButton onClick={onClose} label="Close panel" icon={<X />} />
        </header>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5">
            {children}
          </div>
          <footer className="sticky bottom-0 z-10 flex shrink-0 justify-end gap-2 border-t border-graphite/15 bg-white px-4 py-3">
            {footer}
          </footer>
        </form>
      </aside>
    </>
  );
}
