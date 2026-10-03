import type { ReactNode } from 'react';

export type Tone = 'success' | 'warning' | 'critical' | 'information';

const tones: Record<Tone, string> = {
  success: 'border-success text-success',
  warning: 'border-warning text-warning',
  critical: 'border-critical text-critical',
  information: 'border-information text-information',
};

const severityFills: Record<'low' | 'moderate' | 'high' | 'critical', string> =
  {
    low: 'bg-success/10 text-success border-success/30',
    moderate: 'bg-information/10 text-information border-information/30',
    high: 'bg-warning/10 text-warning border-warning/30',
    critical: 'bg-critical/10 text-critical border-critical/30',
  };

const statusFills: Record<
  'submitted' | 'under_review' | 'action_required' | 'resolved' | 'closed',
  string
> = {
  submitted: 'bg-information/10 text-information border-information/30',
  under_review: 'bg-warning/10 text-warning border-warning/30',
  action_required: 'bg-critical/10 text-critical border-critical/30',
  resolved: 'bg-success/10 text-success border-success/30',
  closed: 'bg-graphite/10 text-graphite border-graphite/30',
};

const typeOutlines: Record<
  'hazard' | 'near_miss' | 'incident' | 'environmental_concern',
  string
> = {
  hazard: 'border-warning text-warning',
  near_miss: 'border-information text-information',
  incident: 'border-critical text-critical',
  environmental_concern: 'border-success text-success',
};

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex rounded-sm border bg-white px-1 text-xs font-semibold ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function Pill({
  label,
  fill,
  className = '',
}: {
  label: string;
  fill: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center h-5 rounded-full px-2 text-[11px] font-semibold leading-5 ${fill} ${className}`}
    >
      {label}
    </span>
  );
}

export function TypePill({
  label,
  className = '',
}: {
  label: 'hazard' | 'near_miss' | 'incident' | 'environmental_concern';
  className?: string;
}) {
  const displayLabel = label.replace('_', ' ');
  return (
    <Pill
      label={displayLabel}
      fill={typeOutlines[label]}
      className={className}
    />
  );
}

export function SeverityPill({
  label,
  className = '',
}: {
  label: 'low' | 'moderate' | 'high' | 'critical';
  className?: string;
}) {
  return (
    <Pill label={label} fill={severityFills[label]} className={className} />
  );
}

export function StatusPill({
  label,
  className = '',
}: {
  label:
    'submitted' | 'under_review' | 'action_required' | 'resolved' | 'closed';
  className?: string;
}) {
  const displayLabel = label.replace('_', ' ');
  return (
    <Pill
      label={displayLabel}
      fill={statusFills[label]}
      className={className}
    />
  );
}

export function Card({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid content-start gap-2.5 rounded-lg border border-graphite/20 bg-white p-2.5">
      {title && (
        <h2 className="text-[13px] font-semibold leading-5 text-deepCharcoal">
          {title}
        </h2>
      )}
      {children}
    </section>
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
      className={`border-l-4 bg-white p-2 ${tones[tone]}`}
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
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-md border border-information/25 bg-information/5 p-3 text-graphite">
      <p className="flex items-center gap-2 text-xs font-semibold text-deepCharcoal">
        {icon && (
          <span className="shrink-0 text-information" aria-hidden="true">
            {icon}
          </span>
        )}
        {title}
      </p>
      <div className="mt-1 text-xs leading-5 text-graphite">{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-4 rounded-lg border border-graphite/20 bg-coolSurface p-4 text-center md:text-left">
      <div className="grid gap-1">
        <h2 className="text-[15px] font-semibold leading-6 text-deepCharcoal">
          {title}
        </h2>
        <p className="mx-auto max-w-[52ch] text-sm leading-6 text-graphite md:mx-0">
          {description}
        </p>
      </div>
      {action && (
        <div className="flex justify-center md:justify-start">{action}</div>
      )}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-1 border-l-4 border-information bg-coolSurface p-2 text-sm font-medium text-graphite"
    >
      <span
        aria-hidden="true"
        className="size-2 animate-spin rounded-full border-2 border-information border-r-transparent motion-reduce:animate-none"
      />
      {label}
    </div>
  );
}
