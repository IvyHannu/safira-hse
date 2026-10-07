'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/shell';
import { Select } from '@/components/ui/forms';
import { checklistSubmissions, flaggedCount } from '@/data/checklists';
import {
  reportList,
  severityOptions,
  siteOptions,
  statusOptions,
  typeOptions,
  type ReportListItem,
} from '@/data/reports';

const snapshotDate =
  reportList
    .map((item) => item.date)
    .sort()
    .at(-1) || '';
type DateRange = 'all' | '7' | '30';

function dateFrom(range: DateRange) {
  if (range === 'all' || !snapshotDate) return '';
  const date = new Date(`${snapshotDate}T12:00:00`);
  date.setDate(date.getDate() - Number(range) + 1);
  return date.toISOString().slice(0, 10);
}

function shortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function countBy<T extends string>(items: T[], keys: T[]) {
  return keys.map((key) => ({
    label: key,
    count: items.filter((item) => item === key).length,
  }));
}

function Breakdown({
  rows,
  total,
  tone,
}: {
  rows: { label: string; count: number }[];
  total: number;
  tone: 'status' | 'severity';
}) {
  return (
    <div className="admin-insights-breakdown">
      {rows.map(({ label, count }) => (
        <div className="admin-insights-bar-row" key={label}>
          <span className="admin-insights-bar-label">
            {label.replaceAll('_', ' ')}
          </span>
          <span className="admin-insights-track" aria-hidden="true">
            <span
              className={`admin-insights-fill admin-insights-${tone}-${label}`}
              style={{ width: `${total ? (count / total) * 100 : 0}%` }}
            />
          </span>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}

function siteName(item: ReportListItem) {
  return item.site.split(' — ')[0];
}

export function AdminInsights() {
  const [site, setSite] = useState('all');
  const [range, setRange] = useState<DateRange>('all');
  const [type, setType] = useState('all');
  const insights = useMemo(() => {
    const start = dateFrom(range);
    const reports = reportList.filter(
      (item) =>
        (site === 'all' || siteName(item) === site) &&
        (type === 'all' || item.type === type) &&
        (!start || item.date >= start),
    );
    const submissions = checklistSubmissions.filter(
      (item) =>
        (site === 'all' || item.site === site) &&
        (!start || item.submittedAt.slice(0, 10) >= start),
    );
    const sites = siteOptions
      .map((option) => option.label)
      .filter((name) => site === 'all' || name === site)
      .map((name) => {
        const siteReports = reports.filter((item) => siteName(item) === name);
        const siteSubmissions = submissions.filter(
          (item) => item.site === name,
        );
        return {
          name,
          reports: siteReports.length,
          priority: siteReports.filter((item) =>
            ['high', 'critical'].includes(item.severity),
          ).length,
          action: siteReports.filter(
            (item) => item.status === 'action_required',
          ).length,
          checklists: siteSubmissions.length,
          flagged: siteSubmissions.filter((item) => flaggedCount(item) > 0)
            .length,
        };
      })
      .sort((a, b) => b.reports - a.reports || a.name.localeCompare(b.name));
    const days = [...new Set(reports.map((item) => item.date))]
      .sort()
      .reverse();
    const cohorts = days.map((date) => {
      const rows = reports.filter((item) => item.date === date);
      return {
        date,
        total: rows.length,
        action: rows.filter((item) => item.status === 'action_required').length,
        resolved: rows.filter((item) =>
          ['resolved', 'closed'].includes(item.status),
        ).length,
      };
    });
    return { reports, submissions, sites, cohorts };
  }, [site, range, type]);

  const { reports, submissions, sites, cohorts } = insights;
  const resolved = reports.filter((item) =>
    ['resolved', 'closed'].includes(item.status),
  ).length;
  const action = reports.filter(
    (item) => item.status === 'action_required',
  ).length;
  const reviewed = submissions.filter(
    (item) => item.status === 'reviewed',
  ).length;
  const flagged = submissions.filter((item) => flaggedCount(item) > 0).length;

  return (
    <div className="admin-insights">
      <PageHeader
        title="Reports & Insights"
        description="Operational patterns across reports and checklist submissions."
      />
      <div className="admin-insights-filters" aria-label="Insight filters">
        <Select
          label="Site"
          value={site}
          onChange={(event) => setSite(event.target.value)}
        >
          <option value="all">All sites</option>
          {siteOptions.map((option) => (
            <option key={option.value} value={option.label}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          label="Date"
          value={range}
          onChange={(event) => setRange(event.target.value as DateRange)}
        >
          <option value="all">All available dates</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </Select>
        <Select
          label="Report type"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="all">All report types</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <p className="admin-insights-context">
        Snapshot through{' '}
        {snapshotDate ? shortDate(snapshotDate) : 'the latest record'}. Report
        type applies to report measures; checklist measures use site and date.
      </p>

      <div className="admin-insights-metrics" aria-label="Filtered summary">
        <div>
          <span>Reports</span>
          <strong>{reports.length}</strong>
          <small>Submitted in selection</small>
        </div>
        <div>
          <span>Require action</span>
          <strong>{action}</strong>
          <small>Current status</small>
        </div>
        <div>
          <span>Resolved / closed</span>
          <strong>{resolved}</strong>
          <small>Current status</small>
        </div>
        <div>
          <span>Checklist submissions</span>
          <strong>{submissions.length}</strong>
          <small>{flagged} flagged</small>
        </div>
      </div>

      <div className="admin-insights-grid">
        <section className="admin-insights-panel">
          <div className="admin-insights-heading">
            <h2>Report status</h2>
            <p>Current state of selected reports</p>
          </div>
          <Breakdown
            rows={countBy(
              reports.map((item) => item.status),
              statusOptions.map((item) => item.value),
            )}
            total={reports.length}
            tone="status"
          />
        </section>
        <section className="admin-insights-panel">
          <div className="admin-insights-heading">
            <h2>Severity distribution</h2>
            <p>HSE-assessed severity</p>
          </div>
          <Breakdown
            rows={countBy(
              reports.map((item) => item.severity),
              severityOptions.map((item) => item.value),
            )}
            total={reports.length}
            tone="severity"
          />
        </section>
      </div>

      <div className="admin-insights-grid admin-insights-grid-wide">
        <section className="admin-insights-panel">
          <div className="admin-insights-heading">
            <h2>Site comparison</h2>
            <p>Report pressure and flagged checklist submissions</p>
          </div>
          <div className="admin-insights-table-wrap">
            <table className="admin-insights-table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Reports</th>
                  <th>High / critical</th>
                  <th>Action</th>
                  <th>Checklists</th>
                  <th>Flagged</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((item) => (
                  <tr key={item.name}>
                    <th>{item.name}</th>
                    <td>{item.reports}</td>
                    <td>{item.priority}</td>
                    <td>{item.action}</td>
                    <td>{item.checklists}</td>
                    <td>{item.flagged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="admin-insights-panel">
          <div className="admin-insights-heading">
            <h2>Checklist review</h2>
            <p>Submitted checklists in selection</p>
          </div>
          <dl className="admin-insights-facts">
            <div>
              <dt>Reviewed</dt>
              <dd>
                {reviewed} of {submissions.length}
              </dd>
            </div>
            <div>
              <dt>Needs review</dt>
              <dd>{submissions.length - reviewed}</dd>
            </div>
            <div>
              <dt>Flagged submissions</dt>
              <dd>{flagged}</dd>
            </div>
            <div>
              <dt>Flagged issues</dt>
              <dd>
                {submissions.reduce((sum, item) => sum + flaggedCount(item), 0)}
              </dd>
            </div>
          </dl>
          <p className="admin-insights-note">
            Assignment totals are unavailable, so completion rate is not shown.
          </p>
        </section>
      </div>

      <section className="admin-insights-panel admin-insights-trends">
        <div className="admin-insights-heading">
          <h2>Action & resolution by report date</h2>
          <p>Current outcomes grouped by when reports were submitted</p>
        </div>
        {cohorts.length ? (
          <div className="admin-insights-table-wrap">
            <table className="admin-insights-table">
              <thead>
                <tr>
                  <th>Submitted</th>
                  <th>Reports</th>
                  <th>Require action now</th>
                  <th>Resolved / closed now</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((item) => (
                  <tr key={item.date}>
                    <th>{shortDate(item.date)}</th>
                    <td>{item.total}</td>
                    <td>{item.action}</td>
                    <td>{item.resolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-insights-empty">
            No reports match these filters.
          </p>
        )}
        <p className="admin-insights-note">
          Actual action and resolution dates are not in the local records; this
          view does not measure time to resolution.
        </p>
      </section>
    </div>
  );
}
