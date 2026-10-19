'use client';

import type { ReactNode } from 'react';
import { PencilSimple } from '@phosphor-icons/react';

export function ImageEditControl({
  children,
  imageLabel,
  editLabel,
  onEdit,
}: {
  children: ReactNode;
  imageLabel: string;
  editLabel: string;
  onEdit: () => void;
}) {
  return (
    <div className="relative size-16 shrink-0">
      <span
        role="img"
        aria-label={imageLabel}
        className="flex size-16 items-center justify-center overflow-hidden rounded-md border border-graphite/20 bg-coolSurface text-deepCharcoal"
      >
        {children}
      </span>
      <button
        type="button"
        aria-label={editLabel}
        onClick={onEdit}
        className="absolute -bottom-2 -right-2 flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signalYellow"
      >
        <span className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-signalYellow text-deepCharcoal shadow-sm transition-colors hover:bg-signalYellow/90 active:bg-signalYellow/80 motion-reduce:transition-none">
          <PencilSimple size={16} weight="bold" aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
