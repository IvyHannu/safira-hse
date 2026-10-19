'use client';

import { useEffect, type ComponentProps, type ReactNode } from 'react';
import { Button as BaseButton } from '@/components/ui/button';
import {
  Input as BaseInput,
  Select as BaseSelect,
  Textarea as BaseTextarea,
} from '@/components/ui/forms';
export { Card, EmptyState } from '@/components/ui/feedback';
export { ReportMetadata } from '@/components/ui/report-metadata';

export function OfficerPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`officer-detail-panel safira-card-surface ${className}`}
    >
      {children}
    </section>
  );
}

export function OfficerFormPanel({
  title,
  icon,
  context,
  field,
  action,
  children,
}: {
  title: string;
  icon: ReactNode;
  context: ReactNode;
  field: ReactNode;
  action: ReactNode;
  children?: ReactNode;
}) {
  return (
    <OfficerPanel className="grid content-start gap-[12px]">
      <SectionHeader title={title} icon={icon} compact />
      <div className="text-xs leading-5 text-graphite/70">{context}</div>
      {field}
      <div className="flex justify-end">{action}</div>
      {children}
    </OfficerPanel>
  );
}

export function OfficerHistory({
  title,
  entries,
}: {
  title: string;
  entries: readonly { actor: string; date: string; body: string }[];
}) {
  if (!entries.length) return null;
  return (
    <div className="border-t border-graphite/10 pt-3">
      <h3 className="mb-1 text-xs font-semibold text-graphite/75">{title}</h3>
      <div className="divide-y divide-graphite/10">
        {entries.map((entry, index) => (
          <div
            key={`${entry.date}-${index}`}
            className="py-2 first:pt-1 last:pb-0"
          >
            <div className="flex flex-wrap items-center gap-x-2 text-xs leading-5">
              <span className="font-semibold text-deepCharcoal">
                {entry.actor}
              </span>
              <time dateTime={entry.date} className="text-graphite/70">
                {new Date(entry.date).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
            <p className="mt-1 text-sm leading-5 text-graphite">{entry.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  icon,
  action,
  urgent = false,
  compact = false,
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  urgent?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`${compact ? '' : 'mb-3'} flex items-center justify-between gap-3`}
    >
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
