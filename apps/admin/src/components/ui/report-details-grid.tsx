export interface ReportDetailItem {
  label: string;
  value: string;
}

export function ReportDetailsGrid({ items }: { items: ReportDetailItem[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map(({ label, value }) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-graphite/70">
            {label}
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-deepCharcoal">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
