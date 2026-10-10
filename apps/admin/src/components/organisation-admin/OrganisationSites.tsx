'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { MapPin, PencilSimple, Plus, X } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { ActionGroup, Button } from '@/components/ui/button';
import { ClickableCard, InteractiveListItem } from '@/components/ui/feedback';
import { Input, SearchInput, Select } from '@/components/ui/forms';
import { MetadataLabel } from '@/components/ui/report-metadata';
import { IllustrationSlot } from '@/components/ui/illustration-slot';
import { PageHeader } from '@/components/ui/shell';
import {
  initialOrganisationMembers,
  roleLabels,
  type OrganisationMember,
} from '@/data/organisation-users';
import {
  initialOrganisationSites,
  type OrganisationSite,
  type SiteStatus,
  type WorkArea,
} from '@/data/organisation-sites';

const siteKey = 'safira.organisation.sites.v1';
const memberKey = 'safira.organisation.members.v1';
const siteEvent = 'safira-organisation-sites';
type SiteFields = Pick<
  OrganisationSite,
  | 'name'
  | 'location'
  | 'address'
  | 'hseContact'
  | 'emergencyName'
  | 'emergencyPhone'
>;
type AreaFields = Pick<WorkArea, 'name' | 'note'>;
type Editor =
  | { kind: 'site'; siteId?: string }
  | { kind: 'area'; siteId: string; areaId?: string };

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(siteEvent, callback);
  window.addEventListener('safira-organisation-members', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(siteEvent, callback);
    window.removeEventListener('safira-organisation-members', callback);
  };
}

function readSites(value: string | null): OrganisationSite[] {
  if (!value) return initialOrganisationSites;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return initialOrganisationSites;
    return parsed.filter((item): item is OrganisationSite => {
      if (!item || typeof item !== 'object') return false;
      const site = item as Partial<OrganisationSite>;
      return (
        typeof site.id === 'string' &&
        typeof site.name === 'string' &&
        typeof site.location === 'string' &&
        typeof site.address === 'string' &&
        typeof site.hseContact === 'string' &&
        typeof site.emergencyName === 'string' &&
        typeof site.emergencyPhone === 'string' &&
        ['active', 'inactive', 'archived'].includes(site.status || '') &&
        Array.isArray(site.areas) &&
        site.areas.every(
          (area) =>
            area &&
            typeof area.id === 'string' &&
            typeof area.name === 'string' &&
            typeof area.note === 'string' &&
            ['active', 'inactive', 'archived'].includes(area.status),
        )
      );
    });
  } catch {
    return initialOrganisationSites;
  }
}

function readMembers(value: string | null): OrganisationMember[] {
  if (!value) return initialOrganisationMembers;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is OrganisationMember =>
            item &&
            typeof item.name === 'string' &&
            Array.isArray(item.roles) &&
            Array.isArray(item.sites) &&
            typeof item.status === 'string',
        )
      : initialOrganisationMembers;
  } catch {
    return initialOrganisationMembers;
  }
}

function SiteStatusLabel({ status }: { status: SiteStatus }) {
  return (
    <MetadataLabel
      kind="status"
      tone={
        status === 'active'
          ? 'success'
          : status === 'inactive'
            ? 'warning'
            : 'neutral'
      }
      label={
        status === 'active'
          ? 'Active'
          : status === 'inactive'
            ? 'Inactive'
            : 'Archived'
      }
    />
  );
}

export function OrganisationSites() {
  const siteSaved = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(siteKey);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const memberSaved = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(memberKey);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const sites = readSites(siteSaved);
  const members = readMembers(memberSaved);
  const [selectedId, setSelectedId] = useState(initialOrganisationSites[0].id);
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [message, setMessage] = useState('');
  const siteForm = useForm<SiteFields>({
    defaultValues: {
      name: '',
      location: '',
      address: '',
      hseContact: '',
      emergencyName: '',
      emergencyPhone: '',
    },
  });
  const areaForm = useForm<AreaFields>({
    defaultValues: { name: '', note: '' },
  });
  const selected = sites.find((site) => site.id === selectedId) || sites[0];
  const filtered = sites.filter(
    (site) =>
      `${site.name} ${site.location} ${site.areas.map((area) => area.name).join(' ')}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (statusFilter === 'all' || site.status === statusFilter),
  );
  const hsePeople = members.filter(
    (member) =>
      member.status === 'active' &&
      member.roles.some(
        (role) => role === 'hse_admin' || role === 'hse_officer',
      ),
  );

  useEffect(() => {
    if (!editor && !detailOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (editor) setEditor(null);
        else setDetailOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editor, detailOpen]);

  function save(next: OrganisationSite[], notice: string) {
    try {
      window.localStorage.setItem(siteKey, JSON.stringify(next));
      window.dispatchEvent(new Event(siteEvent));
      setMessage(notice);
      return true;
    } catch {
      setMessage('Changes could not be saved. Please try again.');
      return false;
    }
  }

  function changeSite(
    siteId: string,
    update: Partial<OrganisationSite>,
    notice: string,
  ) {
    save(
      sites.map((site) => (site.id === siteId ? { ...site, ...update } : site)),
      notice,
    );
  }

  function changeArea(
    siteId: string,
    areaId: string,
    update: Partial<WorkArea>,
    notice: string,
  ) {
    save(
      sites.map((site) =>
        site.id === siteId
          ? {
              ...site,
              areas: site.areas.map((area) =>
                area.id === areaId ? { ...area, ...update } : area,
              ),
            }
          : site,
      ),
      notice,
    );
  }

  function openSiteEditor(site?: OrganisationSite) {
    siteForm.reset(
      site
        ? {
            name: site.name,
            location: site.location,
            address: site.address,
            hseContact: site.hseContact,
            emergencyName: site.emergencyName,
            emergencyPhone: site.emergencyPhone,
          }
        : {
            name: '',
            location: '',
            address: '',
            hseContact: '',
            emergencyName: '',
            emergencyPhone: '',
          },
    );
    setEditor({ kind: 'site', siteId: site?.id });
  }

  function openAreaEditor(siteId: string, area?: WorkArea) {
    areaForm.reset({ name: area?.name || '', note: area?.note || '' });
    setEditor({ kind: 'area', siteId, areaId: area?.id });
  }

  function submitSite(values: SiteFields) {
    if (!editor || editor.kind !== 'site') return;
    const name = values.name.trim();
    const location = values.location.trim();
    if (name.length < 2) {
      siteForm.setError('name', { message: 'Enter a site name.' });
      return;
    }
    if (
      sites.some(
        (site) =>
          site.name.toLowerCase() === name.toLowerCase() &&
          site.id !== editor.siteId,
      )
    ) {
      siteForm.setError('name', {
        message: 'A site with this name already exists.',
      });
      return;
    }
    if (location.length < 2) {
      siteForm.setError('location', { message: 'Enter a location.' });
      return;
    }
    const fields = {
      name,
      location,
      address: values.address.trim(),
      hseContact: values.hseContact,
      emergencyName: values.emergencyName.trim(),
      emergencyPhone: values.emergencyPhone.trim(),
    };
    if (editor.siteId) {
      const previous = sites.find((site) => site.id === editor.siteId);
      if (!previous) return;
      if (
        save(
          sites.map((site) =>
            site.id === editor.siteId ? { ...site, ...fields } : site,
          ),
          'Site details updated.',
        )
      )
        setEditor(null);
    } else {
      const id = crypto.randomUUID();
      if (
        save(
          [...sites, { id, ...fields, status: 'active', areas: [] }],
          'Site created.',
        )
      ) {
        setSelectedId(id);
        setDetailOpen(true);
        setEditor(null);
      }
    }
  }

  function submitArea(values: AreaFields) {
    if (!editor || editor.kind !== 'area') return;
    const site = sites.find((item) => item.id === editor.siteId);
    if (!site) return;
    const name = values.name.trim();
    if (name.length < 2) {
      areaForm.setError('name', { message: 'Enter a work-area name.' });
      return;
    }
    if (
      site.areas.some(
        (area) =>
          area.name.toLowerCase() === name.toLowerCase() &&
          area.id !== editor.areaId,
      )
    ) {
      areaForm.setError('name', {
        message: 'This work area already exists at the site.',
      });
      return;
    }
    const note = values.note.trim();
    const areas = editor.areaId
      ? site.areas.map((area) =>
          area.id === editor.areaId ? { ...area, name, note } : area,
        )
      : [
          ...site.areas,
          { id: crypto.randomUUID(), name, note, status: 'active' as const },
        ];
    if (
      save(
        sites.map((item) => (item.id === site.id ? { ...item, areas } : item)),
        editor.areaId ? 'Work area updated.' : 'Work area created.',
      )
    )
      setEditor(null);
  }

  function assigned(site: OrganisationSite) {
    return members.filter(
      (member) =>
        member.status === 'active' &&
        (member.roles.includes('organisation_admin') ||
          member.sites.includes(site.name)),
    );
  }

  return (
    <div className="organisation-sites">
      <PageHeader
        title="Sites & Work Areas"
        description="Manage organisation sites, work areas and local site assignments."
        actions={
          <Button
            icon={<Plus size={18} aria-hidden="true" />}
            onClick={() => openSiteEditor()}
          >
            Add site
          </Button>
        }
      />
      <div className="organisation-sites-filters">
        <SearchInput
          label="Search sites"
          className="safira-control-compact"
          placeholder="Site, location or work area"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          label="Status"
          className="safira-control-compact"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </Select>
      </div>
      <p role="status" className="organisation-sites-count">
        {filtered.length} sites
      </p>
      {message && (
        <p
          role="status"
          aria-live="polite"
          className="organisation-sites-message"
        >
          {message}
        </p>
      )}
      <div className="organisation-sites-layout">
        <div className="organisation-sites-list">
          <div className="organisation-sites-cards safira-card-list">
            {filtered.map((site) => (
              <ClickableCard
                key={site.id}
                selected={site.id === selectedId}
                className="organisation-site-card"
                aria-label={`Open ${site.name} site details`}
                onClick={() => {
                  setSelectedId(site.id);
                  setDetailOpen(true);
                }}
              >
                <span className="organisation-site-card-main">
                  <strong>{site.name}</strong>
                  <small>
                    {site.location} · {site.areas.length} work{' '}
                    {site.areas.length === 1 ? 'area' : 'areas'}
                  </small>
                </span>
                <span className="organisation-site-card-meta">
                  <small>HSE: {site.hseContact || 'Not assigned'}</small>
                  <SiteStatusLabel status={site.status} />
                </span>
              </ClickableCard>
            ))}
          </div>
          {!filtered.length && (
            <div className="organisation-sites-empty grid gap-3 text-center">
              <IllustrationSlot illustrationKey="empty" decorative />
              <p>No sites match these filters.</p>
            </div>
          )}
        </div>
        {selected && (
          <section
            className={`organisation-site-detail safira-card-surface ${detailOpen ? 'is-open' : ''}`}
            aria-label={`${selected.name} details`}
          >
            <div className="organisation-site-detail-head">
              <div>
                <p>Site details</p>
                <h2>{selected.name}</h2>
                <span>{selected.location}</span>
              </div>
              <div>
                <SiteStatusLabel status={selected.status} />
                <button
                  className="organisation-site-close"
                  aria-label="Close site details"
                  onClick={() => setDetailOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <ActionGroup className="organisation-site-detail-actions">
              <Button
                variant="secondary"
                size="compact"
                icon={<PencilSimple size={16} />}
                disabled={selected.status === 'archived'}
                onClick={() => openSiteEditor(selected)}
              >
                Edit site
              </Button>
              {selected.status === 'active' ? (
                <Button
                  variant="destructive-outline"
                  size="compact"
                  onClick={() =>
                    changeSite(
                      selected.id,
                      { status: 'inactive' },
                      'Site deactivated.',
                    )
                  }
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="compact"
                  onClick={() =>
                    changeSite(
                      selected.id,
                      { status: 'active' },
                      'Site reactivated.',
                    )
                  }
                >
                  Reactivate
                </Button>
              )}
              {selected.status !== 'archived' && (
                <Button
                  variant="destructive-tertiary"
                  size="compact"
                  onClick={() =>
                    changeSite(
                      selected.id,
                      { status: 'archived' },
                      'Site archived; history retained.',
                    )
                  }
                >
                  Archive
                </Button>
              )}
            </ActionGroup>
            <div className="organisation-site-detail-scroll">
              <section>
                <h3>Location & contacts</h3>
                <dl className="organisation-site-facts">
                  <div>
                    <dt>Location</dt>
                    <dd>{selected.location}</dd>
                  </div>
                  <div>
                    <dt>Address</dt>
                    <dd>{selected.address || 'Not recorded'}</dd>
                  </div>
                  <div>
                    <dt>Site HSE contact</dt>
                    <dd>{selected.hseContact || 'Not assigned'}</dd>
                  </div>
                  <div>
                    <dt>Emergency contact</dt>
                    <dd>
                      {selected.emergencyName || 'Not recorded'}
                      {selected.emergencyPhone &&
                        ` · ${selected.emergencyPhone}`}
                    </dd>
                  </div>
                </dl>
              </section>
              <section>
                <div className="organisation-site-section-head">
                  <div>
                    <h3>Work areas</h3>
                    <p>Areas within this site. Archive to preserve history.</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="compact"
                    icon={<Plus size={16} />}
                    disabled={selected.status !== 'active'}
                    onClick={() => openAreaEditor(selected.id)}
                  >
                    Add area
                  </Button>
                </div>
                {selected.areas.length ? (
                  <ul className="organisation-work-areas">
                    {selected.areas.map((area) => (
                      <li key={area.id}>
                        <InteractiveListItem
                          title={area.name}
                          description={area.note || undefined}
                          leading={<MapPin size={17} />}
                          status={<SiteStatusLabel status={area.status} />}
                          aria-label={`Edit ${area.name} work area`}
                          disabled={selected.status !== 'active'}
                          onClick={() => openAreaEditor(selected.id, area)}
                        />
                        <ActionGroup className="organisation-work-area-actions">
                          <Button
                            variant="secondary"
                            size="compact"
                            icon={<PencilSimple size={16} />}
                            disabled={selected.status !== 'active'}
                            onClick={() => openAreaEditor(selected.id, area)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={
                              area.status === 'active'
                                ? 'destructive-outline'
                                : 'secondary'
                            }
                            size="compact"
                            disabled={selected.status !== 'active'}
                            onClick={() =>
                              changeArea(
                                selected.id,
                                area.id,
                                {
                                  status:
                                    area.status === 'active'
                                      ? 'inactive'
                                      : 'active',
                                },
                                area.status === 'active'
                                  ? 'Work area deactivated.'
                                  : 'Work area reactivated.',
                              )
                            }
                          >
                            {area.status === 'active'
                              ? 'Deactivate'
                              : 'Reactivate'}
                          </Button>
                          {area.status !== 'archived' && (
                            <Button
                              variant="destructive-tertiary"
                              size="compact"
                              disabled={selected.status !== 'active'}
                              onClick={() =>
                                changeArea(
                                  selected.id,
                                  area.id,
                                  { status: 'archived' },
                                  'Work area archived; history retained.',
                                )
                              }
                            >
                              Archive
                            </Button>
                          )}
                        </ActionGroup>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="organisation-sites-empty">
                    No work areas recorded.
                  </p>
                )}
              </section>
              <section>
                <h3>Assigned members & roles</h3>
                <p className="organisation-site-section-note">
                  Current local assignments for this site.
                </p>
                {assigned(selected).length ? (
                  <ul className="organisation-site-members">
                    {assigned(selected).map((member) => (
                      <li key={member.id}>
                        <strong>{member.name}</strong>
                        <span>
                          {member.roles
                            .map((role) => roleLabels[role])
                            .join(', ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="organisation-sites-empty">
                    No active members assigned.
                  </p>
                )}
              </section>
            </div>
          </section>
        )}
      </div>
      {editor && (
        <div className="organisation-site-modal-root">
          <button
            className="organisation-site-backdrop"
            aria-label="Close editor"
            onClick={() => setEditor(null)}
          />
          <section
            className="organisation-site-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="organisation-site-editor-title"
          >
            <div className="organisation-site-editor-head">
              <div>
                <p>{editor.kind === 'site' ? 'Site setup' : 'Work area'}</p>
                <h2 id="organisation-site-editor-title">
                  {editor.kind === 'site'
                    ? editor.siteId
                      ? 'Edit site'
                      : 'Add site'
                    : editor.areaId
                      ? 'Edit work area'
                      : 'Add work area'}
                </h2>
              </div>
              <button aria-label="Close editor" onClick={() => setEditor(null)}>
                <X size={20} />
              </button>
            </div>
            {editor.kind === 'site' ? (
              <form onSubmit={siteForm.handleSubmit(submitSite)} noValidate>
                <Input
                  label="Site name"
                  disabled={!!editor.siteId}
                  helperText={
                    editor.siteId
                      ? 'Site identity stays fixed to preserve existing assignments.'
                      : undefined
                  }
                  {...siteForm.register('name')}
                  error={siteForm.formState.errors.name?.message}
                />
                <Input
                  label="Location"
                  placeholder="Town or district"
                  {...siteForm.register('location')}
                  error={siteForm.formState.errors.location?.message}
                />
                <Input
                  label="Address"
                  placeholder="Optional street address"
                  {...siteForm.register('address')}
                />
                <Select
                  label="Site HSE contact"
                  {...siteForm.register('hseContact')}
                >
                  <option value="">Not assigned</option>
                  {hsePeople.map((member) => (
                    <option value={member.name} key={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
                <div className="organisation-site-form-pair">
                  <Input
                    label="Emergency contact name"
                    {...siteForm.register('emergencyName')}
                  />
                  <Input
                    label="Emergency contact phone"
                    type="tel"
                    {...siteForm.register('emergencyPhone')}
                  />
                </div>
                <div className="organisation-site-editor-actions">
                  <Button variant="secondary" onClick={() => setEditor(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editor.siteId ? 'Save site' : 'Create site'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={areaForm.handleSubmit(submitArea)} noValidate>
                <Input
                  label="Work area name"
                  {...areaForm.register('name')}
                  error={areaForm.formState.errors.name?.message}
                />
                <Input
                  label="Area note"
                  helperText="Optional orientation for site members."
                  {...areaForm.register('note')}
                />
                <div className="organisation-site-editor-actions">
                  <Button variant="secondary" onClick={() => setEditor(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editor.areaId ? 'Save work area' : 'Create work area'}
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
