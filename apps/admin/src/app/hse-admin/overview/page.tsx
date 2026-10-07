'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Warning,
  CheckCircle,
  ClipboardText,
} from '@phosphor-icons/react';
import { Card, EmptyState } from '@/components/ui/feedback';
import { SearchInput } from '@/components/ui/forms';
import { Button } from '@/components/ui/button';
import {
  ReportMetadata,
  ReportSeverityLabel,
  ReportStatusLabel,
  ReportTypeLabel,
} from '@/components/ui/report-metadata';
import { PageHeader } from '@/components/ui/shell';
import {
  overviewReports,
  overviewChecklistSummary,
  overviewSnapshotDate,
} from '@/data/admin-overview';
const openReports = overviewReports.filter(
  (report) => !['resolved', 'closed'].includes(report.status),
);
const priority = { critical: 0, high: 1, moderate: 2, low: 3 };
const attention = openReports
  .filter(
    (report) =>
      report.status === 'action_required' ||
      ['critical', 'high'].includes(report.severity),
  )
  .sort(
    (a, b) =>
      priority[a.severity] - priority[b.severity] ||
      b.date.localeCompare(a.date),
  );
const metrics = [
  {
    label: 'Open Reports',
    value: openReports.length,
    icon: FileText,
    tone: 'information',
  },
  {
    label: 'Require Action',
    value: openReports.filter((report) => report.status === 'action_required')
      .length,
    icon: Warning,
    tone: 'warning',
  },
  {
    label: 'Critical / High Priority',
    value: openReports.filter((report) =>
      ['critical', 'high'].includes(report.severity),
    ).length,
    icon: Warning,
    tone: 'critical',
  },
  {
    label: 'Resolved Today',
    value: overviewReports.filter(
      (report) =>
        report.status === 'resolved' && report.date === overviewSnapshotDate,
    ).length,
    icon: CheckCircle,
    tone: 'success',
  },
];
function dateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
export default function OverviewPage() {
  const [search, setSearch] = useState('');
  const [allAttention, setAllAttention] = useState(false);
  const [allRecent, setAllRecent] = useState(false);
  const matches = (report: (typeof overviewReports)[number]) =>
    `${report.id} ${report.title} ${report.site}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
  const needsAttention = attention.filter(matches);
  const recent = [...overviewReports]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(matches);
  return (
    <div className="admin-overview">
      <PageHeader
        title="Overview"
        description="Operational snapshot across all sites."
        actions={
          <p className="text-xs font-medium text-graphite/80">
            {dateLabel(overviewSnapshotDate)}
          </p>
        }
      />
      <div className="admin-search">
        <SearchInput
          label="Search overview"
          placeholder="Search reports or sites…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && (
          <Button variant="tertiary" onClick={() => setSearch('')}>
            Clear
          </Button>
        )}
      </div>
      <div className="admin-metrics" aria-label="Operational metrics">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="admin-kpi-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold leading-8">{value}</p>
                <h2 className="mt-1 text-sm font-medium">{label}</h2>
              </div>
              <span className={`admin-metric-icon tone-${tone}`}>
                <Icon size={20} aria-hidden="true" />
              </span>
            </div>
          </Card>
        ))}
      </div>
      <div className="admin-overview-panels">
        <Card>
          <div className="admin-section-heading">
            <h2>Needs Attention</h2>
            {needsAttention.length > 4 && (
              <Button
                variant="tertiary"
                onClick={() => setAllAttention(!allAttention)}
              >
                {allAttention ? 'Show less' : 'View all'}
              </Button>
            )}
          </div>
          <ul className="admin-attention-list safira-card-list">
            {needsAttention
              .slice(0, allAttention ? undefined : 4)
              .map((report) => (
                <li key={report.id}>
                  <Link
                    href={`/hse-admin/reports/${report.id}`}
                    className="admin-attention-row safira-card-surface safira-card-action"
                  >
                    <Warning
                      size={18}
                      aria-hidden="true"
                      className={
                        report.severity === 'critical'
                          ? 'text-critical'
                          : 'text-warning'
                      }
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-5">
                        {report.title}
                      </p>
                      <p className="mt-1 text-xs text-graphite/75">
                        {report.id} · {report.site}
                      </p>
                      <div className="mt-2">
                        <ReportMetadata
                          type={report.type}
                          severity={report.severity}
                          status={report.status}
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
          {!needsAttention.length && (
            <EmptyState
              title="No matching priority reports"
              description="Try a different search."
            />
          )}
        </Card>
        <Card>
          <div className="admin-section-heading">
            <h2>Recent Reports</h2>
            {recent.length > 5 && (
              <Button
                variant="tertiary"
                onClick={() => setAllRecent(!allRecent)}
              >
                {allRecent ? 'Show less' : 'View all'}
              </Button>
            )}
          </div>
          <table className="admin-recent-table">
            <caption className="sr-only">
              Recent reports across all sites
            </caption>
            <thead>
              <tr>
                <th>Report</th>
                <th>Assessment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.slice(0, allRecent ? undefined : 5).map((report) => (
                <tr key={report.id}>
                  <td>
                    <Link
                      href={`/hse-admin/reports/${report.id}`}
                      className="admin-report-link"
                    >
                      {report.title}
                    </Link>
                    <span className="block text-xs text-graphite/70">
                      {report.id}
                    </span>
                    <span className="block text-xs text-graphite/80">
                      {report.site}
                    </span>
                    <ReportTypeLabel type={report.type} />
                  </td>
                  <td>
                    <div className="grid gap-1">
                      <ReportSeverityLabel severity={report.severity} />
                      <ReportStatusLabel status={report.status} />
                    </div>
                  </td>
                  <td>{dateLabel(report.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="admin-recent-mobile safira-card-list">
            {recent.slice(0, allRecent ? undefined : 5).map((report) => (
              <li key={report.id}>
                <Link
                  href={`/hse-admin/reports/${report.id}`}
                  className="admin-recent-link safira-card-surface safira-card-action"
                >
                  <p className="text-sm font-semibold">{report.title}</p>
                  <p className="mt-1 text-xs text-graphite/70">
                    {report.id} · {report.site}
                  </p>
                  <div className="my-2">
                    <ReportMetadata
                      type={report.type}
                      severity={report.severity}
                      status={report.status}
                    />
                  </div>
                  <p className="text-xs text-graphite/70">
                    {dateLabel(report.date)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          {!recent.length && (
            <EmptyState
              title="No matching reports"
              description="Try a different search."
            />
          )}
        </Card>
      </div>
      <Card>
        <div className="admin-section-heading">
          <h2 className="flex items-center gap-2">
            <ClipboardText size={20} aria-hidden="true" />
            Checklist status
          </h2>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          {[
            { label: 'Submissions', value: overviewChecklistSummary.submitted },
            {
              label: 'Needs review',
              value: overviewChecklistSummary.needsReview,
            },
            {
              label: 'Flagged submissions',
              value: overviewChecklistSummary.flagged,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border-l-2 border-coolConcrete pl-3"
            >
              <dt className="text-xs text-graphite/70">{item.label}</dt>
              <dd className="mt-1 text-xl font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
