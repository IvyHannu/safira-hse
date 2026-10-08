'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { IllustrationSlot } from '@/components/ui/illustration-slot';
import { Input, SearchInput, Select } from '@/components/ui/forms';
import { MetadataLabel } from '@/components/ui/report-metadata';
import { checklistSubmissions } from '@/data/checklists';
import { assigneeOptions, reportList, siteOptions } from '@/data/reports';
import './site-hse-setup.css';

type SiteStatus = 'active' | 'inactive' | 'archived';
type AreaSetup = { name: string; reportingEnabled: boolean };
type SiteSetup = {
  id: string;
  name: string;
  status: SiteStatus;
  hseContact: string;
  emergencyName: string;
  emergencyPhone: string;
  checklistsEnabled: boolean;
  reportsEnabled: boolean;
  areas: AreaSetup[];
};
type ContactFields = Pick<
  SiteSetup,
  'hseContact' | 'emergencyName' | 'emergencyPhone'
>;
const storageKey = 'safira.hseAdmin.siteSetup.v1';
const initialSites: SiteSetup[] = siteOptions.map((site) => ({
  id: site.value,
  name: site.label,
  status: 'active',
  hseContact: '',
  emergencyName: '',
  emergencyPhone: '',
  checklistsEnabled: true,
  reportsEnabled: true,
  areas: [
    ...new Set(
      reportList
        .filter((report) => report.site.startsWith(`${site.label} — `))
        .map((report) => report.site.split(' — ').slice(1).join(' — ')),
    ),
  ]
    .sort()
    .map((name) => ({ name, reportingEnabled: true })),
}));
function restoreSites(value: unknown): SiteSetup[] | null {
  if (!Array.isArray(value)) return null;
  return initialSites.map((site) => {
    const saved = value.find(
      (item: unknown) =>
        !!item &&
        typeof item === 'object' &&
        (item as Partial<SiteSetup>).id === site.id,
    ) as Partial<SiteSetup> | undefined;
    if (!saved) return site;
    return {
      ...site,
      status:
        saved.status === 'inactive' || saved.status === 'archived'
          ? saved.status
          : 'active',
      hseContact: typeof saved.hseContact === 'string' ? saved.hseContact : '',
      emergencyName:
        typeof saved.emergencyName === 'string' ? saved.emergencyName : '',
      emergencyPhone:
        typeof saved.emergencyPhone === 'string' ? saved.emergencyPhone : '',
      checklistsEnabled:
        typeof saved.checklistsEnabled === 'boolean'
          ? saved.checklistsEnabled
          : true,
      reportsEnabled:
        typeof saved.reportsEnabled === 'boolean' ? saved.reportsEnabled : true,
      areas: site.areas.map((area) => ({
        ...area,
        reportingEnabled:
          !Array.isArray(saved.areas) ||
          saved.areas.find((item: AreaSetup) => item?.name === area.name)
            ?.reportingEnabled !== false,
      })),
    };
  });
}
const statusLabel: Record<SiteStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
};
function SiteStatusLabel({ status }: { status: SiteStatus }) {
  return (
    <MetadataLabel
      kind="status"
      tone={status === 'active' ? 'success' : 'neutral'}
      label={statusLabel[status]}
    />
  );
}

function SitePanel({
  site,
  onChange,
  onClose,
  onMessage,
}: {
  site: SiteSetup;
  onChange: (next: SiteSetup) => void;
  onClose: () => void;
  onMessage: (message: string) => void;
}) {
  const [tab, setTab] = useState<'details' | 'areas' | 'scope'>('details');
  const form = useForm<ContactFields>({
    defaultValues: site,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const reports = reportList.filter((item) =>
    item.site.startsWith(`${site.name} — `),
  );
  const submissions = checklistSubmissions.filter(
    (item) => item.site === site.name,
  );
  const change = (patch: Partial<SiteSetup>, message: string) => {
    onChange({ ...site, ...patch });
    onMessage(message);
  };
  return (
    <div
      className="admin-site-panel safira-card-surface"
      role="region"
      aria-label={`${site.name} HSE setup`}
    >
      <div className="admin-site-panel-head">
        <div>
          <p className="admin-site-eyebrow">Site / HSE setup</p>
          <h2>{site.name}</h2>
        </div>
        <div className="admin-site-panel-actions">
          <SiteStatusLabel status={site.status} />
          <Button
            variant="tertiary"
            icon={<X size={18} />}
            className="admin-site-close"
            aria-label="Close site details"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
      <div
        className="admin-site-tabs"
        role="tablist"
        aria-label="Site setup sections"
      >
        <button
          role="tab"
          aria-selected={tab === 'details'}
          onClick={() => setTab('details')}
        >
          Site details
        </button>
        <button
          role="tab"
          aria-selected={tab === 'areas'}
          onClick={() => setTab('areas')}
        >
          Work areas
        </button>
        <button
          role="tab"
          aria-selected={tab === 'scope'}
          onClick={() => setTab('scope')}
        >
          HSE scope
        </button>
      </div>
      {tab === 'details' && (
        <section className="admin-site-content" role="tabpanel">
          <div className="admin-site-section-head">
            <h3>Site contacts</h3>
            <p>HSE contacts and emergency details for this site.</p>
          </div>
          <form
            onSubmit={form.handleSubmit((values) => {
              onChange({
                ...site,
                hseContact: values.hseContact,
                emergencyName: values.emergencyName.trim(),
                emergencyPhone: values.emergencyPhone.trim(),
              });
              onMessage('Site contacts saved.');
            })}
          >
            <div className="admin-site-form-grid">
              <Select label="Site HSE contact" {...form.register('hseContact')}>
                <option value="">Not assigned</option>
                {assigneeOptions
                  .filter((option) => option.value !== 'unassigned')
                  .map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
              </Select>
              <Input
                label="Emergency contact name"
                {...form.register('emergencyName')}
              />
              <Input
                label="Emergency contact phone"
                type="tel"
                {...form.register('emergencyPhone', {
                  validate: (value) =>
                    !value ||
                    /^[+()\d\s-]{7,24}$/.test(value) ||
                    'Enter a valid contact number.',
                })}
                error={form.formState.errors.emergencyPhone?.message}
              />
            </div>
            <Button type="submit">Save contacts</Button>
          </form>
          <div className="admin-site-lifecycle">
            <div>
              <h3>Site status</h3>
              <p className="admin-site-muted">
                Deactivation pauses HSE availability. Archival retains the site
                and its history.
              </p>
            </div>
            <div className="admin-site-actions">
              {site.status === 'active' ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    change({ status: 'inactive' }, 'Site deactivated.')
                  }
                >
                  Deactivate site
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() =>
                    change({ status: 'active' }, 'Site reactivated.')
                  }
                >
                  Reactivate site
                </Button>
              )}
              {site.status !== 'archived' && (
                <Button
                  variant="tertiary"
                  onClick={() =>
                    change({ status: 'archived' }, 'Site archived.')
                  }
                >
                  Archive site
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
      {tab === 'areas' && (
        <section className="admin-site-content" role="tabpanel">
          <div className="admin-site-section-head">
            <h3>Work areas</h3>
            <p>
              Existing areas linked to site reports. Set where reporting is
              available.
            </p>
          </div>
          {site.areas.length ? (
            <div className="admin-site-areas">
              {site.areas.map((area) => (
                <div className="admin-site-area" key={area.name}>
                  <div>
                    <strong>{area.name}</strong>
                    <p className="admin-site-muted">
                      {
                        reports.filter((report) =>
                          report.site.endsWith(` — ${area.name}`),
                        ).length
                      }{' '}
                      {reports.filter((report) =>
                        report.site.endsWith(` — ${area.name}`),
                      ).length === 1
                        ? 'report'
                        : 'reports'}{' '}
                      in this area
                    </p>
                  </div>
                  <label className="admin-site-switch">
                    <input
                      type="checkbox"
                      checked={area.reportingEnabled}
                      disabled={
                        site.status !== 'active' || !site.reportsEnabled
                      }
                      onChange={(event) =>
                        change(
                          {
                            areas: site.areas.map((item) =>
                              item.name === area.name
                                ? {
                                    ...item,
                                    reportingEnabled: event.target.checked,
                                  }
                                : item,
                            ),
                          },
                          'Work area reporting updated.',
                        )
                      }
                    />
                    Reporting
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-site-muted">
              No work areas are recorded for this site.
            </p>
          )}
          <p className="admin-site-muted">
            Work area names are managed in Organisation Admin.
          </p>
        </section>
      )}
      {tab === 'scope' && (
        <section className="admin-site-content" role="tabpanel">
          <div className="admin-site-section-head">
            <h3>Checklist & reporting scope</h3>
            <p>
              HSE availability for this site. Historical records remain visible.
            </p>
          </div>
          <div className="admin-site-scope-row">
            <div>
              <strong>Worker reporting</strong>
              <p className="admin-site-muted">
                {reports.length} existing{' '}
                {reports.length === 1 ? 'report' : 'reports'}
              </p>
            </div>
            <label className="admin-site-switch">
              <input
                type="checkbox"
                checked={site.reportsEnabled}
                disabled={site.status !== 'active'}
                onChange={(event) =>
                  change(
                    { reportsEnabled: event.target.checked },
                    'Site reporting scope updated.',
                  )
                }
              />
              Enabled
            </label>
          </div>
          <div className="admin-site-scope-row">
            <div>
              <strong>Checklists</strong>
              <p className="admin-site-muted">
                {submissions.length} existing submissions
              </p>
            </div>
            <label className="admin-site-switch">
              <input
                type="checkbox"
                checked={site.checklistsEnabled}
                disabled={site.status !== 'active'}
                onChange={(event) =>
                  change(
                    { checklistsEnabled: event.target.checked },
                    'Site checklist scope updated.',
                  )
                }
              />
              Enabled
            </label>
          </div>
          <div className="admin-site-links">
            <Link href="/hse-admin/reports">View reports</Link>
            <Link href="/hse-admin/checklists">View checklists</Link>
          </div>
        </section>
      )}
    </div>
  );
}

export function SiteHseSetup() {
  const [sites, setSites] = useState(initialSites);
  const [selected, setSelected] = useState(initialSites[0].id);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | SiteStatus>('all');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const task = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const restored = restoreSites(JSON.parse(raw));
          if (restored) setSites(restored);
        }
      } catch {
        setMessage('Saved site setup could not be restored.');
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(task);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);
  const update = (next: SiteSetup) => {
    const updated = sites.map((site) => (site.id === next.id ? next : site));
    setSites(updated);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      setMessage('Could not save site setup. Please try again.');
    }
  };
  const filtered = sites.filter(
    (site) =>
      `${site.name} ${site.areas.map((area) => area.name).join(' ')}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (filter === 'all' || site.status === filter),
  );
  const current = sites.find((site) => site.id === selected);
  return (
    <div className="admin-sites">
      <header>
        <div>
          <h1>Sites</h1>
          <p>
            HSE contacts, work areas and reporting scope for existing sites.
          </p>
        </div>
      </header>
      {message && (
        <p className="admin-site-message" role="status">
          {message}
        </p>
      )}
      <div className="admin-sites-layout">
        <div className="admin-sites-list-column">
          <div className="admin-sites-filters">
            <SearchInput
              label="Search sites"
              placeholder="Site or work area"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              label="Status"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as typeof filter)
              }
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <p className="admin-site-count" role="status">
            {filtered.length} sites
          </p>
          <div className="admin-sites-list safira-card-list">
            {filtered.length ? (
              filtered.map((site) => (
                <button
                  key={site.id}
                  className="safira-card-surface safira-card-action"
                  aria-current={site.id === selected}
                  onClick={() => {
                    setSelected(site.id);
                    setMobileOpen(true);
                    setMessage('');
                  }}
                >
                  <span className="admin-site-list-icon">
                    <MapPin size={18} aria-hidden="true" />
                  </span>
                  <span className="admin-site-list-copy">
                    <strong>{site.name}</strong>
                    <small>
                      {site.areas.length}{' '}
                      {site.areas.length === 1 ? 'work area' : 'work areas'} ·{' '}
                      {
                        reportList.filter((report) =>
                          report.site.startsWith(`${site.name} — `),
                        ).length
                      }{' '}
                      {reportList.filter((report) =>
                        report.site.startsWith(`${site.name} — `),
                      ).length === 1
                        ? 'report'
                        : 'reports'}
                    </small>
                  </span>
                  <SiteStatusLabel status={site.status} />
                </button>
              ))
            ) : (
              <div className="admin-site-empty grid gap-3 text-center">
                <IllustrationSlot illustrationKey="empty" decorative />
                <p>No matching sites.</p>
              </div>
            )}
          </div>
        </div>
        {loaded && current && (
          <div
            className={`admin-site-detail-wrap ${mobileOpen ? 'is-open' : ''}`}
          >
            <SitePanel
              key={current.id}
              site={current}
              onChange={update}
              onClose={() => setMobileOpen(false)}
              onMessage={setMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
