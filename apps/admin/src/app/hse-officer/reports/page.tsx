'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Funnel,
  X,
  Calendar,
  CaretDown,
} from '@phosphor-icons/react';
import { TableFoundation } from '@/components/ui/table';
import { Select, Input, useOfficerLayer } from '@/components/hse-officer/ui';
import {
  TypePill,
  SeverityPill,
  StatusPill,
} from '@/components/hse-officer/ui';
import {
  reportList,
  statusOptions,
  severityOptions,
  typeOptions,
  siteOptions,
  ReportType,
  Severity,
  Status,
  ReportListItem,
} from '@/data/reports';

function ReportsTable({ reports }: { reports: ReportListItem[] }) {
  const columns = [
    {
      accessorKey: 'report',
      header: 'Report',
      size: 420,
      cell: ({ row }: { row: { original: ReportListItem } }) => (
        <Link
          href={`/hse-officer/reports/${row.original.id}`}
          className="flex flex-col gap-0.5 min-w-0 hover:text-signalYellow transition-colors"
        >
          <span className="text-sm font-medium text-deepCharcoal line-clamp-2 leading-snug">
            {row.original.title}
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-medium text-graphite/50">
              {row.original.id}
            </span>
            <span className="text-graphite/60">{row.original.site}</span>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      size: 130,
      cell: ({ row }: { row: { original: ReportListItem } }) => (
        <TypePill label={row.original.type} />
      ),
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      size: 120,
      cell: ({ row }: { row: { original: ReportListItem } }) => (
        <SeverityPill label={row.original.severity} />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 150,
      cell: ({ row }: { row: { original: ReportListItem } }) => (
        <StatusPill label={row.original.status} />
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      size: 110,
      cell: ({ row }: { row: { original: ReportListItem } }) => (
        <span className="text-sm text-graphite whitespace-nowrap">
          {formatDate(row.original.date)}
        </span>
      ),
    },
  ];

  return (
    <TableFoundation
      caption="Reports for permitted sites"
      columns={columns}
      data={reports}
      emptyMessage="No reports match the current filters."
    />
  );
}

function ReportCard({ report }: { report: ReportListItem }) {
  return (
    <Link
      href={`/hse-officer/reports/${report.id}`}
      className="grid gap-2 rounded-lg border border-graphite/10 bg-white p-2.5 hover:border-graphite/30 hover:shadow-sm transition-colors"
    >
      <div className="grid gap-1.5">
        <p className="text-sm font-medium text-deepCharcoal leading-snug">
          {report.title}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="font-mono font-medium text-graphite/50">
            {report.id}
          </span>
          <TypePill label={report.type} />
          <span className="text-graphite/60">{report.site}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <SeverityPill label={report.severity} />
          <StatusPill label={report.status} />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-graphite/10 pt-1.5 text-xs">
        <span className="text-graphite/60">{formatDate(report.date)}</span>
        <ArrowRight size={12} className="text-graphite/60" aria-hidden="true" />
      </div>
    </Link>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function FilterToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
  typeFilter,
  setTypeFilter,
  siteFilter,
  setSiteFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  dateFilterOpen,
  setDateFilterOpen,
  hasActiveFilters,
  clearFilters,
}: {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: Status | 'all';
  setStatusFilter: (v: Status | 'all') => void;
  severityFilter: Severity | 'all';
  setSeverityFilter: (v: Severity | 'all') => void;
  typeFilter: ReportType | 'all';
  setTypeFilter: (v: ReportType | 'all') => void;
  siteFilter: string;
  setSiteFilter: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  dateFilterOpen: boolean;
  setDateFilterOpen: (v: boolean) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}) {
  const compactSelectClass = 'w-full text-sm';

  return (
    <div className="officer-toolbar" role="search" aria-label="Report filters">
      {/* Search - dominant control */}
      <div className="relative flex-1 min-w-0">
        <label htmlFor="report-search" className="sr-only">
          Search reports
        </label>
        <input
          id="report-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, title, location…"
          className="h-9 w-full pl-10 pr-4 rounded-md border border-graphite/20 bg-white text-sm text-deepCharcoal placeholder:text-graphite/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
        />
        <Funnel
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite/50"
          aria-hidden="true"
        />
      </div>

      {/* Compact filter selects */}
      <div className="officer-filter-selects">
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
          className={compactSelectClass}
        >
          <option value="all">Status</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Select
          label="Severity"
          value={severityFilter}
          onChange={(e) =>
            setSeverityFilter(e.target.value as Severity | 'all')
          }
          className={compactSelectClass}
        >
          <option value="all">Severity</option>
          {severityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Select
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ReportType | 'all')}
          className={compactSelectClass}
        >
          <option value="all">Type</option>
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Select
          label="Site"
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className={compactSelectClass}
        >
          <option value="all">Site</option>
          {siteOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Date filter - compact popover */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDateFilterOpen(!dateFilterOpen)}
          className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-graphite/20 bg-white px-3 text-sm font-medium text-graphite hover:bg-coolSurface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information ${dateFilterOpen ? 'bg-coolSurface' : ''}`}
        >
          <Calendar size={14} aria-hidden="true" />
          <span>{dateFrom || dateTo ? 'Date' : 'Date'}</span>
          <CaretDown size={12} aria-hidden="true" />
        </button>
        {dateFilterOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDateFilterOpen(false)}
            aria-hidden="true"
          />
        )}
        {dateFilterOpen && (
          <div className="absolute right-0 z-50 mt-1 w-[280px] rounded-lg border border-graphite/20 bg-white shadow-xl p-3">
            <div className="grid gap-2">
              <Input
                label="From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full"
              />
              <Input
                label="To"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-graphite/20 bg-white px-2 text-xs font-medium text-graphite hover:bg-coolSurface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
                >
                  <X size={11} aria-hidden="true" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters - secondary action */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-1 rounded-md px-2 text-sm font-medium text-graphite/70 hover:text-graphite hover:bg-coolSurface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
        >
          <X size={12} aria-hidden="true" />
          <span>Clear</span>
        </button>
      )}
    </div>
  );
}

function MobileFilterSheet({
  isOpen,
  onClose,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
  typeFilter,
  setTypeFilter,
  siteFilter,
  setSiteFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  hasActiveFilters,
  clearFilters,
}: {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: Status | 'all';
  setStatusFilter: (v: Status | 'all') => void;
  severityFilter: Severity | 'all';
  setSeverityFilter: (v: Severity | 'all') => void;
  typeFilter: ReportType | 'all';
  setTypeFilter: (v: ReportType | 'all') => void;
  siteFilter: string;
  setSiteFilter: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}) {
  useOfficerLayer(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-deepCharcoal/60 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Report filters"
        data-officer-dialog
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm md:hidden bg-white border-l border-graphite/20 shadow-xl flex flex-col"
      >
        <div className="flex h-14 items-center justify-between border-b border-graphite/20 px-4">
          <h2 className="text-sm font-semibold text-deepCharcoal">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-graphite/70 hover:text-graphite hover:bg-coolSurface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
            aria-label="Close filters"
          >
            <CaretDown size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid content-start gap-4">
          <div>
            <label
              htmlFor="mobile-search"
              className="text-xs font-semibold uppercase tracking-wide text-graphite/70"
            >
              Search
            </label>
            <input
              id="mobile-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, title, location…"
              className="mt-1.5 h-9 w-full pl-10 pr-4 rounded-md border border-graphite/20 bg-white text-sm text-deepCharcoal placeholder:text-graphite/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
            />
            <Funnel
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite/50"
              aria-hidden="true"
            />
          </div>
          <div className="grid gap-3">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as Status | 'all')
              }
              className="w-full"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Select
              label="Severity"
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(e.target.value as Severity | 'all')
              }
              className="w-full"
            >
              <option value="all">All Severities</option>
              {severityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Select
              label="Type"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as ReportType | 'all')
              }
              className="w-full"
            >
              <option value="all">All Types</option>
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Select
              label="Site"
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full"
            >
              <option value="all">All Sites</option>
              {siteOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-3">
            <Input
              label="Date From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full"
            />
            <Input
              label="Date To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full"
            />
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                clearFilters();
                onClose();
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-graphite/20 bg-white px-3 py-2 text-sm font-medium text-graphite hover:bg-coolSurface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information mt-2"
            >
              <X size={14} aria-hidden="true" />
              Clear All Filters
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dateFilterRef.current &&
        !dateFilterRef.current.contains(event.target as Node)
      ) {
        setDateFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredReports = useMemo(() => {
    return reportList.filter((report) => {
      const matchesSearch =
        report.id.toLowerCase().includes(search.toLowerCase()) ||
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.site.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || report.status === statusFilter;
      const matchesSeverity =
        severityFilter === 'all' || report.severity === severityFilter;
      const matchesType = typeFilter === 'all' || report.type === typeFilter;
      const matchesSite =
        siteFilter === 'all' ||
        report.site.includes(
          siteOptions.find((s) => s.value === siteFilter)?.label ?? '',
        );

      const reportDate = new Date(report.date);
      const matchesDateFrom = !dateFrom || reportDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || reportDate <= new Date(dateTo);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity &&
        matchesType &&
        matchesSite &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    search,
    statusFilter,
    severityFilter,
    typeFilter,
    siteFilter,
    dateFrom,
    dateTo,
  ]);

  const hasActiveFilters: boolean =
    statusFilter !== 'all' ||
    severityFilter !== 'all' ||
    typeFilter !== 'all' ||
    siteFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '';

  const clearFilters = () => {
    setStatusFilter('all');
    setSeverityFilter('all');
    setTypeFilter('all');
    setSiteFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="w-full min-w-0">
      <div ref={dateFilterRef}>
        {/* Page Header */}
        <div className="mb-3">
          <h1 className="text-[22px] font-semibold leading-7 text-deepCharcoal">
            Reports
          </h1>
          <p className="mt-0.5 text-sm leading-6 text-graphite">
            Review and manage reports for your permitted sites.
          </p>
        </div>

        {/* Desktop Filter Toolbar */}
        <div className="hidden md:block mb-3">
          <FilterToolbar
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            severityFilter={severityFilter}
            setSeverityFilter={setSeverityFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            siteFilter={siteFilter}
            setSiteFilter={setSiteFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            dateFilterOpen={dateFilterOpen}
            setDateFilterOpen={setDateFilterOpen}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
          />
        </div>

        {/* Mobile: Search + Filters Button */}
        <div className="md:hidden mb-3">
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <label htmlFor="mobile-search-top" className="sr-only">
                Search reports
              </label>
              <input
                id="mobile-search-top"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports…"
                className="h-9 w-full pl-10 pr-4 rounded-md border border-graphite/20 bg-white text-sm text-deepCharcoal placeholder:text-graphite/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
              />
              <Funnel
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite/50"
                aria-hidden="true"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-graphite/20 bg-white px-3 text-sm font-medium text-graphite hover:bg-coolSurface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
            >
              <Funnel size={16} aria-hidden="true" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-signalYellow text-deepCharcoal text-[10px] font-bold">
                  {filteredReports.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="grid gap-2" role="list" aria-label="Filtered reports">
          {filteredReports.length === 0 ? (
            <div className="rounded-lg border border-graphite/20 bg-white p-6 text-center">
              <p className="text-sm font-semibold text-deepCharcoal">
                No reports found
              </p>
              <p className="mt-1 text-sm text-graphite">
                Try adjusting your search or filters.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium officer-link"
                >
                  <X size={14} aria-hidden="true" />
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <ReportsTable reports={filteredReports} />
              </div>
              <div className="md:hidden grid gap-2" role="list">
                {filteredReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </>
          )}
        </div>

        <MobileFilterSheet
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          siteFilter={siteFilter}
          setSiteFilter={setSiteFilter}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />
      </div>
    </div>
  );
}
