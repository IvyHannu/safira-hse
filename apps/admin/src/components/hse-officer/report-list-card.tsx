import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';
import type { ReportListItem } from '@/data/reports';
import { ReportMetadata } from './ui';

export function ReportListCard({ report }: { report: ReportListItem }) {
  return (
    <Link
      href={`/hse-officer/reports/${report.id}`}
      className="report-card group"
      aria-label={`Open report ${report.id}: ${report.title}`}
    >
      <div className="grid min-w-0 gap-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto] lg:items-center lg:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug text-deepCharcoal">
            {report.title}
          </p>
          <span className="mt-1 block shrink-0 font-mono text-xs font-medium text-graphite/75">
            {report.id}
          </span>
        </div>
        <span className="min-w-0 text-xs text-graphite/75">{report.site}</span>
        <ReportMetadata
          type={report.type}
          severity={report.severity}
          status={report.status}
        />
        <div className="flex items-center justify-between border-t border-graphite/15 pt-2 text-xs lg:justify-end lg:gap-3 lg:border-0 lg:pt-0">
          <span className="whitespace-nowrap text-graphite/75">
            {new Date(report.date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <ArrowRight
            size={14}
            className="text-graphite/60 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}
