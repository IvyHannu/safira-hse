import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type Tone = 'success' | 'warning' | 'critical' | 'information';

const tones: Record<Tone, string> = {
  success: 'border-success text-success',
  warning: 'border-warning text-warning',
  critical: 'border-critical text-critical',
  information: 'border-information text-information',
};

export function Card({
  title,
  children,
  raised = false,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  raised?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`safira-card-surface grid content-start gap-3 p-4 ${raised ? 'md:p-5' : ''} ${className}`}
    >
      {title && (
        <h2 className="text-[13px] font-semibold leading-5 text-deepCharcoal">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export function ClickableCard({
  selected = false,
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      aria-pressed={selected}
      className={`safira-card-surface safira-card-action safira-clickable-card ${className}`}
    >
      {children}
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
  variant = 'information',
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'information' | 'reference';
}) {
  return (
    <div
      className={`rounded-md border p-3 text-graphite ${variant === 'reference' ? 'border-graphite/20 border-l-2 border-l-information bg-white shadow-sm' : 'border-information/25 bg-information/5'}`}
    >
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
