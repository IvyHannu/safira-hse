'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Warning,
  CheckCircle,
  FileText,
} from '@phosphor-icons/react';
import {
  Card,
  TypePill,
  SeverityPill,
  StatusPill,
} from '@/components/hse-officer/ui';
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
  const toneColors = {
    critical: 'bg-critical/10 text-critical border-critical/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    success: 'bg-success/10 text-success border-success/30',
    information: 'bg-information/10 text-information border-information/30',
  };

  return (
    <Link
      href={href}
      className="group grid gap-1.5 rounded-lg border bg-white p-2.5 transition-colors hover:border-graphite/30 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-graphite">{title}</p>
          <p className="mt-0 text-[20px] font-semibold leading-6 text-deepCharcoal">
            {value}
          </p>
        </div>
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${toneColors[tone]}`}
          aria-hidden="true"
        >
          <Icon size={16} />
        </div>
      </div>
    </Link>
  );
}

function ReportRow({
  ref,
  title,
  site,
  classification,
  severity,
  status,
  timestampLabel,
  timestamp,
  isCritical = false,
}: {
  ref: string;
  title: string;
  site: string;
  classification: 'hazard' | 'near_miss' | 'incident' | 'environmental_concern';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status:
    'submitted' | 'under_review' | 'action_required' | 'resolved' | 'closed';
  timestampLabel: string;
  timestamp: string;
  isCritical?: boolean;
}) {
  const rowClass =
    isCritical && severity === 'critical'
      ? 'border-critical/30 bg-critical/5'
      : 'border-graphite/10';

  return (
    <Link
      href={`/hse-officer/reports/${ref}`}
      className={`officer-row grid gap-2 ${rowClass}`}
    >
      <div className="grid gap-0.5 min-w-0">
        <p className="text-sm font-medium text-deepCharcoal leading-snug">
          {title}
        </p>
        <p className="text-xs text-graphite/70">{site}</p>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <TypePill label={classification} />
        <SeverityPill label={severity} />
        <StatusPill label={status} />
      </div>

      <div className="flex items-center justify-between border-t border-graphite/10 pt-1 text-[10px]">
        <span className="text-graphite/60 uppercase tracking-wide">
          {timestampLabel}
        </span>
        <span className="font-medium text-graphite whitespace-nowrap">
          {timestamp}
        </span>
        <ArrowRight
          size={9}
          className="text-graphite/60 group-hover:text-signalYellow transition-colors"
          aria-hidden="true"
        />
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-2">
      <h2
        className={`text-[13px] font-semibold leading-5 text-deepCharcoal uppercase tracking-wide ${urgent ? 'text-critical' : ''}`}
      >
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium officer-link self-start sm:self-auto"
      >
        {actionLabel}
        <ArrowRight size={9} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <div className="grid gap-4">
      <PageHeader
        title="Overview"
        description="Operational snapshot for your permitted sites."
      />

      <div
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        role="list"
        aria-label="Key metrics"
      >
        {kpiCards.map((card) => (
          <KPICard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2 items-start">
        <Card>
          <SectionHeader
            title="Needs Attention"
            href="/hse-officer/reports?status=action_required"
            urgent
          />
          <div
            className="grid gap-1"
            role="list"
            aria-label="Reports needing attention"
          >
            {needsAttention.map((report) => (
              <ReportRow
                key={report.ref}
                ref={report.ref}
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
        </Card>

        <Card>
          <SectionHeader title="Recent Reports" href="/hse-officer/reports" />
          <div className="grid gap-1" role="list" aria-label="Recent reports">
            {recentReports.map((report) => (
              <ReportRow
                key={report.ref}
                ref={report.ref}
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
        </Card>
      </div>
    </div>
  );
}
