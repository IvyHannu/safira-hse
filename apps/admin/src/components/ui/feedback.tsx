import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import type { IllustrationKey } from '@safira/design-tokens';
import { IllustrationSlot } from './illustration-slot';

export type Tone = 'success' | 'warning' | 'critical' | 'information';

export function MetricCard({
  value,
  label,
  helper,
  icon,
  tone = 'information',
  href,
}: {
  value: number | string;
  label: string;
  helper?: string;
  icon?: ReactNode;
  tone?: Tone;
  href?: string;
}) {
  const content = (
    <>
      <span className="safira-metric-card-head">
        <strong className="safira-metric-card-number">{value}</strong>
        {icon && (
          <span className="safira-metric-card-icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </span>
      <span className="safira-metric-card-label">{label}</span>
      {helper && <small className="safira-metric-card-helper">{helper}</small>}
    </>
  );
  const className = `safira-card-surface safira-metric-card ${href ? 'safira-card-action' : ''}`;
  return href ? (
    <Link href={href} className={className} data-tone={tone} role="listitem">
      {content}
    </Link>
  ) : (
    <section className={className} data-tone={tone}>
      {content}
    </section>
  );
}

const tones: Record<Tone, string> = {
  success: 'border-success text-success',
  warning: 'border-warning text-warning',
  critical: 'border-critical text-critical',
  information: 'border-information text-information',
};

export function Card({
  title,
  icon,
  children,
  raised = false,
  compact = false,
  className = '',
}: {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  raised?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`safira-card-surface grid content-start ${compact ? 'gap-2 p-3' : `gap-2 p-3 ${raised ? 'md:p-4' : ''}`} ${className}`}
    >
      {title && (
        <h2 className="flex min-h-5 items-center gap-2 text-[13px] font-semibold leading-5 text-deepCharcoal">
          {icon && (
            <span
              className="flex size-[18px] shrink-0 items-center justify-center"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <span>{title}</span>
        </h2>
      )}
      {icon ? <div className="min-w-0 pl-[26px]">{children}</div> : children}
    </section>
  );
}

export function ClickableCard({
  selected = false,
  selectionStyle = 'accent',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  selectionStyle?: 'accent' | 'neutral';
}) {
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      aria-pressed={selected}
      data-selection-style={selectionStyle}
      className={`safira-card-surface safira-card-action safira-clickable-card ${className}`}
    >
      {children}
    </button>
  );
}

export function InteractiveListItem({
  title,
  description,
  leading,
  status,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string;
  description?: string;
  leading?: ReactNode;
  status?: ReactNode;
}) {
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={`safira-card-surface safira-card-action safira-interactive-row ${className}`}
    >
      {leading && (
        <span className="safira-interactive-row-icon" aria-hidden="true">
          {leading}
        </span>
      )}
      <span className="safira-interactive-row-copy">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      {status && (
        <span className="safira-interactive-row-status">{status}</span>
      )}
    </button>
  );
}

export function Alert({
  tone,
  title,
  children,
}: {
  tone: Tone;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === 'critical' ? 'alert' : 'status'}
      className={`rounded-md border bg-white p-2 ${tones[tone]}`}
    >
      <p className="font-semibold">{title}</p>
      <div className="mt-1 text-sm text-graphite">{children}</div>
    </div>
  );
}

export function InfoCard({
  title,
  children,
  icon,
  variant = 'information',
  compact = false,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'information' | 'reference' | 'neutral';
  compact?: boolean;
}) {
  return (
    <div
      className={`grid gap-x-2 rounded-md border text-graphite ${compact ? 'gap-y-0.5 p-3' : 'gap-y-1 p-4'} ${icon ? 'grid-cols-[20px_minmax(0,1fr)]' : 'grid-cols-1'} ${variant === 'neutral' || variant === 'reference' ? 'safira-card-surface' : 'border-information/25 bg-information/5'}`}
    >
      {icon && (
        <span
          className="row-span-2 flex size-5 items-start justify-center text-information"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <p className="min-w-0 text-xs font-semibold leading-5 text-deepCharcoal">
        {title}
      </p>
      <div
        className={`min-w-0 text-xs text-graphite ${compact ? 'leading-4' : 'leading-5'}`}
      >
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  illustrationKey = 'empty',
}: {
  title: string;
  description: string;
  action?: ReactNode;
  illustrationKey?: IllustrationKey;
}) {
  return (
    <div className="grid justify-items-center gap-3 rounded-lg border border-graphite/20 bg-coolSurface p-4 text-center">
      <IllustrationSlot illustrationKey={illustrationKey} decorative />
      <div className="grid gap-1">
        <h2 className="text-[15px] font-semibold leading-6 text-deepCharcoal">
          {title}
        </h2>
        <p className="max-w-[52ch] text-sm leading-6 text-graphite">
          {description}
        </p>
      </div>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="safira-card-surface flex items-center gap-1 p-2 text-sm font-medium text-graphite"
    >
      <span
        aria-hidden="true"
        className="size-2 animate-spin rounded-full border-2 border-information border-r-transparent motion-reduce:animate-none"
      />
      {label}
    </div>
  );
}
