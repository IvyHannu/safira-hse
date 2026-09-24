import type { ReactNode } from 'react';

export type Tone = 'success' | 'warning' | 'critical' | 'information';

const tones: Record<Tone, string> = {
  success: 'border-success text-success',
  warning: 'border-warning text-warning',
  critical: 'border-critical text-critical',
  information: 'border-information text-information',
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

export function Card({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid content-start gap-4 rounded-lg border border-graphite/20 bg-white p-4">
      {title && (
        <h2 className="text-[15px] font-semibold leading-6 text-softBlack">{title}</h2>
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
    <div className="grid gap-4 rounded-lg border border-graphite/20 bg-warmBone p-4 text-center md:text-left">
      <div className="grid gap-1">
        <h2 className="text-[15px] font-semibold leading-6 text-softBlack">{title}</h2>
        <p className="mx-auto max-w-[52ch] text-sm leading-6 text-graphite md:mx-0">{description}</p>
      </div>
      {action && <div className="flex justify-center md:justify-start">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-1 border-l-4 border-information bg-warmBone p-2 text-sm font-medium text-graphite"
    >
      <span
        aria-hidden="true"
        className="size-2 animate-spin rounded-full border-2 border-information border-r-transparent motion-reduce:animate-none"
      />
      {label}
    </div>
  );
}
