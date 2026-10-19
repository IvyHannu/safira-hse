'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Warning,
  CheckCircle,
  FileText,
} from '@phosphor-icons/react';
import { PageHeader } from '@/components/ui/shell';
import { MetricCard } from '@/components/ui/feedback';
import { ReportMetadata } from '@/components/ui/report-metadata';

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

/** Shared report row for Needs Attention and Recent Reports. */
function ReportRow({
  reportRef,
  title,
  site,
  classification,
  severity,
  status,
  timestampLabel,
  timestamp,
}: {
  reportRef: string;
  title: string;
  site: string;
  classification: 'hazard' | 'near_miss' | 'incident' | 'environmental_concern';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status:
    'submitted' | 'under_review' | 'action_required' | 'resolved' | 'closed';
  timestampLabel: string;
  timestamp: string;
}) {
  return (
    <Link
      href={`/hse-officer/reports/${reportRef}`}
      role="listitem"
      aria-label={`${reportRef}: ${title}`}
      className="officer-row safira-card-surface safira-card-action group"
    >
      {/* Ref + title + site */}
      <div className="min-w-0">
        <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-1.5">
          <span className="shrink-0 font-mono text-xs font-semibold text-graphite/75">
            {reportRef}
          </span>
          <p className="min-w-0 text-sm font-semibold leading-5 text-deepCharcoal">
            {title}
          </p>
        </div>
        <p className="mt-1 text-xs leading-4 text-graphite/75">
          {site.replace(' — ', ' · ')}
        </p>
      </div>

      {/* Metadata: Type • Severity   Status */}
      <div className="min-w-0">
        <ReportMetadata
          type={classification}
          severity={severity}
          status={status}
        />
      </div>

      {/* Meta footer */}
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 text-xs text-graphite/75">
          {timestampLabel} · {timestamp}
        </span>
        <span className="shrink-0" aria-hidden="true">
          <ArrowRight
            size={14}
            className="text-graphite/35 transition-colors group-hover:text-information"
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
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2
        className={`text-sm font-semibold leading-5 ${
          urgent ? 'text-critical' : 'text-deepCharcoal'
        }`}
      >
        {title}
      </h2>
      <Link href={href} className="officer-link">
        {actionLabel}
        <ArrowRight size={12} aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <div className="grid gap-3 md:gap-5">
      <PageHeader
        title="Overview"
        description="Operational snapshot for your permitted sites."
      />

      {/* KPI cards */}
      <div
        className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4"
        role="list"
        aria-label="Key metrics"
      >
        {kpiCards.map(({ title, value, icon: Icon, tone, href }) => (
          <MetricCard
            key={title}
            value={value}
            label={title}
            icon={<Icon weight="bold" />}
            tone={tone}
            href={href}
          />
        ))}
      </div>

      {/* Report sections */}
      <div className="grid items-start gap-3 md:gap-4 xl:grid-cols-2">
        <section
          className="overview-report-section min-w-0"
          aria-label="Reports needing attention"
        >
          <SectionHeader
            title="Needs Attention"
            href="/hse-officer/reports?status=action_required"
            urgent
          />
          <div className="safira-card-list" role="list">
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
              />
            ))}
          </div>
        </section>

        <section
          className="overview-report-section min-w-0"
          aria-label="Recent reports"
        >
          <SectionHeader title="Recent Reports" href="/hse-officer/reports" />
          <div className="safira-card-list" role="list">
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
