import type { ReactNode } from 'react';

export function PageContainer({
  children,
  narrow = false,
}: {
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full px-4 py-6 ${narrow ? 'max-w-[720px]' : 'max-w-[1120px]'}`}
    >
      <div className="grid gap-6">{children}</div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-graphite/20 pb-4">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-7 text-deepCharcoal">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-[768px] text-sm leading-6 text-graphite">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}

export interface SidebarItem {
  href: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
}

export function SidebarShell({
  title,
  items,
}: {
  title: string;
  items: SidebarItem[];
}) {
  return (
    <aside
      className="w-full border-b border-graphite/20 bg-white px-4 py-3 md:w-60 md:border-b-0 md:border-r"
      aria-label={title}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-graphite">
        {title}
      </p>
      <nav aria-label={title} className="flex flex-wrap gap-1 md:grid">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={item.active ? 'page' : undefined}
            className={`inline-flex h-9 items-center gap-2 rounded-md border-l-4 px-2.5 text-sm font-medium text-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information ${item.active ? 'border-signalYellow bg-coolSurface font-semibold' : 'border-transparent hover:bg-coolSurface'}`}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export function TopbarShell({
  brand,
  actions,
}: {
  brand: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-graphite/20 bg-white px-4">
      <span className="text-sm font-semibold text-deepCharcoal">{brand}</span>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}
