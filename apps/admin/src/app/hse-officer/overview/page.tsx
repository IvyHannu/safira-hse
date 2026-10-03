'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Warning,
  CheckCircle,
  FileText,
  Circle,
} from '@phosphor-icons/react';
import { PageHeader } from '@/components/ui/shell';

const kpiCards = [
  {
    title: 'Open Reports',
    value: '24',
    icon: FileText,
    tone: 'information' as const,
    href: '/hse-officer/reports?status=submitted,under_review',
  },
  {
    title: 'Require Action',
    value: '8',
    icon: Warning,
    tone: 'warning' as const,
    href: '/hse-officer/reports?status=action_required',
  },
  {
    title: 'Critical / High Priority',
    value: '3',
    icon: Warning,
    tone: 'critical' as const,
    href: '/hse-officer/reports?severity=high,critical',
  },
  {
    title: 'Resolved Today',
    value: '5',
    icon: CheckCircle,
    tone: 'success' as const,
    href: '/hse-officer/reports?status=resolved&period=today',
  },
] as const;

const needsAttention = [
  {
    ref: 'SF-2048',
    title: 'Chemical spill near storage tank 3',
    site: 'Riverside Refinery — Tank Farm',
    classification: 'environmental_concern' as const,
    severity: 'critical' as const,
    status: 'action_required' as const,
    updated: '2 hours ago',
  },
  {
    ref: 'SF-2045',
    title: 'Missing guardrail on elevated walkway',
    site: 'North Construction Site — Level 4',
    classification: 'hazard' as const,
    severity: 'high' as const,
    status: 'under_review' as const,
    updated: '5 hours ago',
  },
  {
    ref: 'SF-2042',
    title: 'Improper PPE observed in welding bay',
    site: 'Harbor Yard — Fabrication Shop',
    classification: 'hazard' as const,
    severity: 'moderate' as const,
    status: 'submitted' as const,
    updated: '1 day ago',
  },
] as const;

const recentReports = [
  {
    ref: 'SF-2050',
    title: 'Slip hazard on loading dock',
    site: 'Riverside Logistics — Dock B',
    classification: 'hazard' as const,
    severity: 'moderate' as const,
    status: 'submitted' as const,
    submitted: '30 min ago',
  },
  {
    ref: 'SF-2049',
    title: 'Near miss: forklift pedestrian interaction',
    site: 'Riverside Warehouse — Aisle 12',
    classification: 'near_miss' as const,
    severity: 'high' as const,
    status: 'under_review' as const,
    submitted: '1 hour ago',
  },
  {
    ref: 'SF-2047',
    title: 'Oil sheen on retention pond',
    site: 'Riverside Refinery — Pond 2',
    classification: 'environmental_concern' as const,
    severity: 'moderate' as const,
    status: 'submitted' as const,
    submitted: '3 hours ago',
  },
  {
    ref: 'SF-2046',
    title: 'Damaged fire extinguisher cabinet',
    site: 'North Construction Site — Site Office',
    classification: 'hazard' as const,
    severity: 'low' as const,
    status: 'resolved' as const,
    submitted: '6 hours ago',
  },
  {
    ref: 'SF-2044',
    title: 'Blocked emergency exit corridor',
    site: 'Harbor Yard — Admin Building',
    classification: 'hazard' as const,
    severity: 'high' as const,
    status: 'action_required' as const,
    submitted: '1 day ago',
  },
] as const;

const toneIconColors = {
  critical: 'bg-critical/10 text-critical',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
  information: 'bg-information/10 text-information',
} as const;

function KPICard({
  title,
  value,
  icon: Icon,
  tone,
  href,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  tone: 'success' | 'warning' | 'critical' | 'information';
  href: string;
}) {
  return (
    <Link
      href={href}
      role="listitem"
      className="overview-card group flex flex-col gap-2 p-3 hover:no-underline"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium leading-5 text-graphite">{title}</p>
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${toneIconColors[tone]}`}
          aria-hidden="true"
        >
          <Icon size={16} weight="bold" />
        </div>
      </div>
      <p className="text-[22px] font-semibold leading-7 text-deepCharcoal tabular-nums">
        {value}
      </p>
    </Link>
  );
}

/**
 * Shared report row — used in both Needs Attention and Recent Reports.
 * isCritical adds a left accent for critical-severity rows in Needs Attention.
 */
function ReportRow({
  reportRef,
  title,
  site,
  classification,
  severity,
  status,
  timestampLabel,
  timestamp,
  isCritical = false,
}: {
  reportRef: string;
  title: string;
  site: string;
  classification: 'hazard' | 'near_miss' | 'incident' | 'environmental_concern';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status:
    | 'submitted'
    | 'under_review'
    | 'action_required'
    | 'resolved'
    | 'closed';
  timestampLabel: string;
  timestamp: string;
  isCritical?: boolean;
}) {
  const criticalAccent =
    isCritical && severity === 'critical'
      ? ' border-l-2 border-l-critical/50'
      : '';

  return (
    <Link
      href={`/hse-officer/reports/${reportRef}`}
      role="listitem"
      aria-label={`${reportRef}: ${title}`}
      className={`officer-row group${criticalAccent}`}
    >
      {/* Ref + title + site */}
      <div className="mb-2 min-w-0">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="shrink-0 font-mono text-[10px] font-semibold tracking-wide text-graphite/45">
            {reportRef}
          </span>
          <p className="truncate text-[13px] font-semibold leading-snug text-deepCharcoal">
            {title}
          </p>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-graphite/55">{site}</p>
      </div>

      {/* Metadata: Type • Severity   Status */}
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="uppercase tracking-wider text-graphite/45 font-medium">
          {classification.replace(/_/g, ' ').toUpperCase()}
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

      {/* Meta footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-graphite/45">
          {timestampLabel}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-graphite/60 whitespace-nowrap">
          {timestamp}
          <ArrowRight
            size={11}
            className="text-graphite/35 transition-colors group-hover:text-information"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

function SectionHeader({
  title,
  href,
  actionLabel = 'View all',
  urgent = false,
}: {
  title: string;
  href: string;
  actionLabel?: string;
  urgent?: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2
        className={`overview-section-label font-semibold ${
          urgent ? 'text-critical' : 'text-graphite/55'
        }`}
      >
        {title}
      </h2>
      <Link
        href={href}
        className="officer-link"
      >
        {actionLabel}
        <ArrowRight size={12} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        title="Overview"
        description="Operational snapshot for your permitted sites."
      />

      {/* KPI cards */}
      <div
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        role="list"
        aria-label="Key metrics"
      >
        {kpiCards.map((card) => (
          <KPICard key={card.title} {...card} />
        ))}
      </div>

      {/* Report sections */}
      <div className="grid gap-4 xl:grid-cols-2 items-start">
        <section
          className="overview-card p-4"
          aria-label="Reports needing attention"
        >
          <SectionHeader
            title="Needs Attention"
            href="/hse-officer/reports?status=action_required"
            urgent
          />
          <div role="list">
            {needsAttention.map((report) => (
              <ReportRow
                key={report.ref}
                reportRef={report.ref}
                title={report.title}
                site={report.site}
                classification={report.classification}
                severity={report.severity}
                status={report.status}
                timestampLabel="Updated"
                timestamp={report.updated}
                isCritical={report.severity === 'critical'}
              />
            ))}
          </div>
        </section>

        <section
          className="overview-card p-4"
          aria-label="Recent reports"
        >
          <SectionHeader title="Recent Reports" href="/hse-officer/reports" />
          <div role="list">
            {recentReports.map((report) => (
              <ReportRow
                key={report.ref}
                reportRef={report.ref}
                title={report.title}
                site={report.site}
                classification={report.classification}
                severity={report.severity}
                status={report.status}
                timestampLabel="Submitted"
                timestamp={report.submitted}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
