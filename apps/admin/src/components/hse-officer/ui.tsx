'use client';

import { useEffect, type ComponentProps, type ReactNode } from 'react';
import { Circle } from '@phosphor-icons/react';
import { Button as BaseButton } from '@/components/ui/button';
import {
  Input as BaseInput,
  Select as BaseSelect,
  Textarea as BaseTextarea,
} from '@/components/ui/forms';
export { Card, EmptyState } from '@/components/ui/feedback';

export function OfficerPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`officer-detail-panel ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  icon,
  action,
  urgent = false,
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  urgent?: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-graphite/70" aria-hidden="true">
            {icon}
          </span>
        )}
        <h2
          className={`text-sm font-semibold leading-5 ${urgent ? 'text-critical' : 'text-deepCharcoal'}`}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function Button({
  className = '',
  ...props
}: ComponentProps<typeof BaseButton>) {
  return <BaseButton {...props} className={`officer-button ${className}`} />;
}
export function Input({
  className = '',
  ...props
}: ComponentProps<typeof BaseInput>) {
  return <BaseInput {...props} className={`officer-control ${className}`} />;
}
export function Select({
  className = '',
  ...props
}: ComponentProps<typeof BaseSelect>) {
  return <BaseSelect {...props} className={`officer-control ${className}`} />;
}
export function Textarea({
  className = '',
  ...props
}: ComponentProps<typeof BaseTextarea>) {
  return <BaseTextarea {...props} className={`officer-control ${className}`} />;
}

const labels: Record<string, string> = {
  environmental_concern: 'Environmental concern',
  near_miss: 'Near miss',
  under_review: 'Under review',
  action_required: 'Action required',
  needs_review: 'Needs review',
};

export function ReportMetadata({
  type,
  severity,
  status,
}: {
  type: 'hazard' | 'near_miss' | 'incident' | 'environmental_concern';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status:
    'submitted' | 'under_review' | 'action_required' | 'resolved' | 'closed';
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px]">
      <span className="uppercase tracking-wider text-graphite/70 font-medium">
        {type.replace(/_/g, ' ').toUpperCase()}
      </span>
      <span className="flex items-center gap-1.5">
        <Circle
          size={6}
          weight="fill"
          className={`severity-dot ${severity}`}
          aria-hidden="true"
        />
        <span className={`font-semibold capitalize severity-text ${severity}`}>
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </span>
      </span>
      <span className={`font-medium capitalize status-text ${status}`}>
        {status.replace(/_/g, ' ')}
      </span>
    </div>
  );
}

export function TypePill({
  label,
}: {
  label: 'hazard' | 'near_miss' | 'incident' | 'environmental_concern';
  className?: string;
}) {
  return (
    <span className={`officer-badge officer-type officer-${label}`}>
      {labels[label] ||
        label
          .replaceAll('_', ' ')
          .replace(/^./, (letter) => letter.toUpperCase())}
    </span>
  );
}
export function SeverityPill({
  label,
}: {
  label: 'low' | 'moderate' | 'high' | 'critical';
  className?: string;
}) {
  return (
    <span className={`officer-badge officer-severity officer-${label}`}>
      {labels[label] ||
        label
          .replaceAll('_', ' ')
          .replace(/^./, (letter) => letter.toUpperCase())}
    </span>
  );
}
export function StatusPill({
  label,
}: {
  label:
    'submitted' | 'under_review' | 'action_required' | 'resolved' | 'closed';
  className?: string;
}) {
  return (
    <span className={`officer-badge officer-status officer-${label}`}>
      {labels[label] ||
        label
          .replaceAll('_', ' ')
          .replace(/^./, (letter) => letter.toUpperCase())}
    </span>
  );
}
export function ChecklistBadge({
  status,
}: {
  status: 'needs_review' | 'reviewed';
}) {
  return (
    <span className={`officer-badge officer-status officer-${status}`}>
      {labels[status] ||
        status
          .replaceAll('_', ' ')
          .replace(/^./, (letter) => letter.toUpperCase())}
    </span>
  );
}

/** Keyboard dismissal and focus containment for Officer drawers only. */
export function useOfficerLayer(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const layer = document.querySelector<HTMLElement>('[data-officer-dialog]');
    const controls = () =>
      Array.from(
        layer?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]',
        ) || [],
      ).filter((element) => element.getClientRects().length);
    controls()[0]?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Tab') {
        const items = controls();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    function handleResize() {
      if (window.matchMedia('(min-width: 768px)').matches) onClose();
    }
    document.addEventListener('keydown', handleKey);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', handleResize);
      previous?.focus();
    };
  }, [open, onClose]);
}
