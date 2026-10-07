'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Funnel, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { SearchInput, Select } from '@/components/ui/forms';
import {
  ReportSeverityLabel,
  ReportStatusLabel,
  ReportTypeLabel,
} from '@/components/ui/report-metadata';
import { PageHeader } from '@/components/ui/shell';
import {
  reportList,
  statusOptions,
  severityOptions,
  typeOptions,
} from '@/data/reports';
import './reports.css';

const sites = [
  ...new Set(reportList.map((report) => report.site.split(' — ')[0])),
].sort();
const dates = [...new Set(reportList.map((report) => report.date))]
  .sort()
  .reverse();
const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
const typeLabel = (type: string) =>
  typeOptions.find((option) => option.value === type)?.label;
const initialFilters = {
  status: '',
  severity: '',
  type: '',
  site: '',
  date: '',
};

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const filterButton = useRef<HTMLDivElement>(null);
  const filterCount = Object.values(filters).filter(Boolean).length;
  useEffect(() => {
    if (!open) return;
    const trigger = filterButton.current?.querySelector('button');
    const controls = () =>
      Array.from(
        dialog.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),select',
        ) || [],
      );
    controls()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const elements = controls();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', handleResize);
      trigger?.focus();
    };
  }, [open]);
  const reports = reportList
    .filter(
      (report) =>
        `${report.id} ${report.title} ${report.site} ${typeLabel(report.type)}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()) &&
        (!filters.status || report.status === filters.status) &&
        (!filters.severity || report.severity === filters.severity) &&
        (!filters.type || report.type === filters.type) &&
        (!filters.site || report.site.split(' — ')[0] === filters.site) &&
        (!filters.date || report.date === filters.date),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const clear = () => {
    setFilters(initialFilters);
    setSearch('');
  };
  const fields = (prefix: string) => (
    <>
      {(
        [
          ['status', 'Status', statusOptions],
          ['severity', 'Severity', severityOptions],
          ['type', 'Type', typeOptions],
          ['site', 'Site', sites.map((site) => ({ value: site, label: site }))],
          [
            'date',
            'Date',
            dates.map((date) => ({ value: date, label: formatDate(date) })),
          ],
        ] as const
      ).map(([key, label, options]) => (
        <Select
          key={key}
          id={`${prefix}-${key}`}
          label={label}
          value={filters[key]}
          onChange={(event) =>
            setFilters((current) => ({ ...current, [key]: event.target.value }))
          }
        >
          <option value="">
            All {label.toLowerCase()}
            {label === 'Severity' ? ' levels' : label === 'Status' ? 'es' : 's'}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ))}
    </>
  );
  return (
    <div className="admin-reports">
      <div inert={open || undefined} className="admin-reports-body">
        <PageHeader
          title="Reports"
          description="View and manage all HSE reports."
        />
        <div className="admin-reports-tools">
          <SearchInput
            label="Search reports"
            placeholder="Search by title, reference or location"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="admin-report-desktop-filters">
            {fields('desktop')}
          </div>
          <div ref={filterButton} className="admin-report-filter-trigger">
            <Button
              variant="secondary"
              icon={<Funnel size={18} />}
              className="admin-report-filter-button"
              onClick={() => setOpen(true)}
            >
              Filters{filterCount ? ` (${filterCount})` : ''}
            </Button>
          </div>
        </div>
        <div className="admin-report-results">
          <p role="status">
            {reports.length} {reports.length === 1 ? 'report' : 'reports'}
          </p>
          {(search || filterCount > 0) && (
            <Button variant="tertiary" onClick={clear}>
              Clear filters
            </Button>
          )}
        </div>
        {reports.length ? (
          <>
            <div className="admin-report-table-surface safira-card-surface">
              <table className="admin-report-table">
                <caption className="sr-only">HSE reports</caption>
                <colgroup>
                  <col style={{ width: '29%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '21%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '12%' }} />
                </colgroup>
                <thead>
                  <tr>
                    {[
                      'Report',
                      'Type',
                      'Site / Location',
                      'Severity',
                      'Status',
                      'Date',
                    ].map((label) => (
                      <th key={label} scope="col">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <strong>
                          <Link href={`/hse-admin/reports/${report.id}`}>
                            {report.title}
                          </Link>
                        </strong>
                        <span className="admin-report-reference">
                          {report.id}
                        </span>
                      </td>
                      <td>
                        <ReportTypeLabel type={report.type} />
                      </td>
                      <td>{report.site}</td>
                      <td>
                        <ReportSeverityLabel severity={report.severity} />
                      </td>
                      <td>
                        <ReportStatusLabel status={report.status} />
                      </td>
                      <td>
                        <time dateTime={report.date}>
                          {formatDate(report.date)}
                        </time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-report-cards safira-card-list">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/hse-admin/reports/${report.id}`}
                  className="admin-report-card safira-card-surface safira-card-action"
                >
                  <div className="admin-report-card-heading">
                    <span className="admin-report-reference">{report.id}</span>
                    <ReportStatusLabel status={report.status} />
                  </div>
                  <h2>{report.title}</h2>
                  <p>{report.site}</p>
                  <dl>
                    <div>
                      <dt>Type</dt>
                      <dd>
                        <ReportTypeLabel type={report.type} />
                      </dd>
                    </div>
                    <div>
                      <dt>Severity</dt>
                      <dd>
                        <ReportSeverityLabel severity={report.severity} />
                      </dd>
                    </div>
                    <div>
                      <dt>Date</dt>
                      <dd>
                        <time dateTime={report.date}>
                          {formatDate(report.date)}
                        </time>
                      </dd>
                    </div>
                  </dl>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="admin-report-empty">
            <h2>No matching reports</h2>
            <p>Try another search or clear your filters.</p>
            <Button variant="secondary" onClick={clear}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
      {open && (
        <div className="admin-report-filter-overlay">
          <button
            className="admin-report-filter-backdrop"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <div
            ref={dialog}
            className="admin-report-filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-filter-title"
          >
            <header>
              <h2 id="report-filter-title">Filter reports</h2>
              <Button
                variant="tertiary"
                aria-label="Close filters"
                icon={<X size={20} />}
                onClick={() => setOpen(false)}
              />
            </header>
            <div className="admin-report-sheet-fields">{fields('mobile')}</div>
            <footer>
              <Button
                variant="secondary"
                onClick={() => setFilters(initialFilters)}
              >
                Clear filters
              </Button>
              <Button onClick={() => setOpen(false)}>
                Show {reports.length} reports
              </Button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
