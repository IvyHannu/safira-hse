export interface TimelineEntry {
  date: string;
  event: string;
  user: string;
  details?: string;
}

export function TimelineItem({ item }: { item: TimelineEntry }) {
  return (
    <li className="flex gap-3 border-t border-graphite/10 py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span
        className="mt-1.5 size-3 shrink-0 rounded-full border-[3px] border-information bg-white"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-deepCharcoal">
            {item.event}
          </span>
          <time className="text-xs text-graphite/75" dateTime={item.date}>
            {new Date(item.date).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
        {item.details && (
          <p className="mt-1 whitespace-pre-line text-sm text-graphite/80">
            {item.details}
          </p>
        )}
        <p className="mt-1 text-xs text-graphite/70">By {item.user}</p>
      </div>
    </li>
  );
}

export function Timeline({ items }: { items: TimelineEntry[] }) {
  return (
    <ol className="grid" aria-label="Activity history">
      {items.map((item, index) => (
        <TimelineItem key={`${item.date}-${item.event}-${index}`} item={item} />
      ))}
    </ol>
  );
}
