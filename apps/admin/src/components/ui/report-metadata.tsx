import { Circle } from '@phosphor-icons/react/dist/ssr';
import { metadata } from '@safira/design-tokens';

export type MetadataKind = 'type' | 'severity' | 'status';
export type MetadataTone =
  'neutral' | 'success' | 'warning' | 'critical' | 'information';
export type ReportType =
  'hazard' | 'near_miss' | 'incident' | 'environmental_concern';
export type ReportSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type ReportStatus =
  'submitted' | 'under_review' | 'action_required' | 'resolved' | 'closed';

const toneClass: Record<MetadataTone, string> = {
  neutral: 'text-graphite',
  success: 'text-success',
  warning: 'text-warning',
  critical: 'text-critical',
  information: 'text-information',
};

const severityTone: Record<ReportSeverity, MetadataTone> = {
  low: 'success',
  moderate: 'information',
  high: 'warning',
  critical: 'critical',
};

const statusTone: Record<ReportStatus, MetadataTone> = {
  submitted: 'information',
  under_review: 'neutral',
  action_required: 'critical',
  resolved: 'success',
  closed: 'neutral',
};

function readable(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function MetadataLabel({
  label,
  kind,
  tone = 'neutral',
  className = '',
}: {
  label: string;
  kind: MetadataKind;
  tone?: MetadataTone;
  className?: string;
}) {
  return (
    <span
      className={`safira-metadata inline-flex min-h-5 max-w-full items-center gap-1.5 whitespace-nowrap align-middle leading-5 ${kind === 'type' ? 'text-[11px] font-medium uppercase tracking-wide text-graphite/75' : kind === 'severity' ? `text-xs font-semibold ${toneClass[tone]}` : `text-xs font-medium ${toneClass[tone]}`} ${className}`}
      style={{
        minHeight: metadata.height,
        gap: metadata.gap,
        paddingInline: metadata.paddingX,
        borderRadius: metadata.radius,
        lineHeight: `${metadata.lineHeight}px`,
      }}
    >
      {kind !== 'type' && (
        <Circle
          size={kind === 'severity' ? metadata.dotSize + 1 : metadata.dotSize}
          weight="fill"
          className="shrink-0"
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}

export function ReportTypeLabel({ type }: { type: ReportType }) {
  return <MetadataLabel kind="type" label={readable(type)} />;
}

export function ReportSeverityLabel({
  severity,
}: {
  severity: ReportSeverity;
}) {
  return (
    <MetadataLabel
      kind="severity"
      tone={severityTone[severity]}
      label={readable(severity)}
    />
  );
}

export function ReportStatusLabel({ status }: { status: ReportStatus }) {
  return (
    <MetadataLabel
      kind="status"
      tone={statusTone[status]}
      label={readable(status)}
    />
  );
}

export function ReportMetadata({
  type,
  severity,
  status,
}: {
  type: ReportType;
  severity: ReportSeverity;
  status: ReportStatus;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1"
      aria-label="Report classification and status"
    >
      <ReportTypeLabel type={type} />
      <ReportSeverityLabel severity={severity} />
      <ReportStatusLabel status={status} />
    </div>
  );
}
