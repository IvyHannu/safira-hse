import type { ReactNode } from 'react';

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
    <header className="flex flex-wrap items-start justify-between gap-2 border-b border-graphite pb-2">
      <div>
        <h1 className="text-2xl font-semibold text-softBlack">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-graphite">{description}</p>
        )}
      </div>
      {actions}
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
      className="w-full border-r border-graphite bg-white p-2 md:w-56"
      aria-label={title}
    >
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-graphite">
        {title}
      </p>
      <nav aria-label={title} className="flex flex-wrap gap-1 md:grid">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={item.active ? 'page' : undefined}
            className={`inline-flex min-h-10 items-center gap-1 rounded-sm border-l-4 px-1 text-sm font-medium text-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information ${item.active ? 'border-saffron bg-warmBone font-semibold' : 'border-transparent hover:bg-warmBone'}`}
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
    <header className="flex min-h-14 items-center justify-between gap-2 border-b border-graphite bg-white px-2">
      <span className="font-semibold text-softBlack">{brand}</span>
      <div className="flex items-center gap-1">{actions}</div>
    </header>
  );
}
