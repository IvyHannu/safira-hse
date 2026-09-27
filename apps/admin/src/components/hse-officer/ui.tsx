'use client';

import { useEffect, type ComponentProps } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { Button as BaseButton } from '@/components/ui/button';
import {
  Input as BaseInput,
  Select as BaseSelect,
  Textarea as BaseTextarea,
} from '@/components/ui/forms';
export { Card, EmptyState } from '@/components/ui/feedback';

export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ComponentProps<typeof BaseButton>) {
  return (
    <BaseButton
      {...props}
      variant={variant}
      className={`officer-button officer-button-${variant} ${className}`}
    />
  );
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
  return (
    <div className="officer-select">
      <BaseSelect {...props} className={`officer-control ${className}`} />
      <CaretDown size={16} aria-hidden="true" />
    </div>
  );
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
function Badge({ label, kind }: { label: string; kind: string }) {
  return (
    <span className={`officer-badge officer-${kind} officer-${label}`}>
      {labels[label] ||
        label
          .replaceAll('_', ' ')
          .replace(/^./, (letter) => letter.toUpperCase())}
    </span>
  );
}
export function TypePill({
  label,
}: {
  label: 'hazard' | 'near_miss' | 'incident' | 'environmental_concern';
  className?: string;
}) {
  return <Badge label={label} kind="type" />;
}
export function SeverityPill({
  label,
}: {
  label: 'low' | 'moderate' | 'high' | 'critical';
  className?: string;
}) {
  return <Badge label={label} kind="severity" />;
}
export function StatusPill({
  label,
}: {
  label:
    'submitted' | 'under_review' | 'action_required' | 'resolved' | 'closed';
  className?: string;
}) {
  return <Badge label={label} kind="status" />;
}
export function ChecklistBadge({
  status,
}: {
  status: 'needs_review' | 'reviewed';
}) {
  return <Badge label={status} kind="status" />;
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
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      previous?.focus();
    };
  }, [open, onClose]);
}
