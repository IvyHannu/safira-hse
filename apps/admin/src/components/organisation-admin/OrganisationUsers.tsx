'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { PencilSimple, Plus, X } from '@phosphor-icons/react';
import { useForm, useWatch } from 'react-hook-form';
import type { AuthRole } from '@safira/auth';
import { organisationRoleSchema } from '@safira/validation';
import { Button } from '@/components/ui/button';
import { Input, SearchInput, Select } from '@/components/ui/forms';
import { MetadataLabel } from '@/components/ui/report-metadata';
import { IllustrationSlot } from '@/components/ui/illustration-slot';
import { PageHeader } from '@/components/ui/shell';
import { siteOptions } from '@/data/reports';
import {
  initialOrganisationMembers,
  roleLabels,
  type MemberStatus,
  type OrganisationMember,
} from '@/data/organisation-users';

const storageKey = 'safira.organisation.members.v1';
const changeEvent = 'safira-organisation-members';
const roles = Object.keys(roleLabels) as AuthRole[];

type MemberFields = {
  name: string;
  email: string;
  roles: AuthRole[];
  sites: string[];
};

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(changeEvent, callback);
  };
}

function readMembers(value: string | null): OrganisationMember[] {
  if (!value) return initialOrganisationMembers;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return initialOrganisationMembers;
    return parsed.filter((item): item is OrganisationMember => {
      if (!item || typeof item !== 'object') return false;
      const member = item as Partial<OrganisationMember>;
      return (
        typeof member.id === 'string' &&
        typeof member.name === 'string' &&
        typeof member.email === 'string' &&
        Array.isArray(member.roles) &&
        member.roles.length > 0 &&
        member.roles.every(
          (role) => organisationRoleSchema.safeParse(role).success,
        ) &&
        Array.isArray(member.sites) &&
        member.sites.every((site) => typeof site === 'string') &&
        ['active', 'inactive', 'invited'].includes(member.status || '') &&
        typeof member.lastActive === 'string'
      );
    });
  } catch {
    return initialOrganisationMembers;
  }
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function MemberStatusLabel({ status }: { status: MemberStatus }) {
  return (
    <MetadataLabel
      kind="status"
      tone={
        status === 'active'
          ? 'success'
          : status === 'invited'
            ? 'information'
            : 'neutral'
      }
      label={
        status === 'invited'
          ? 'Invited'
          : status === 'active'
            ? 'Active'
            : 'Inactive'
      }
    />
  );
}

export function OrganisationUsers() {
  const saved = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(storageKey);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const members = readMembers(saved);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sheet, setSheet] = useState<'invite' | string | null>(null);
  const [message, setMessage] = useState('');
  const trigger = useRef<HTMLButtonElement | null>(null);
  const form = useForm<MemberFields>({
    defaultValues: { name: '', email: '', roles: ['worker'], sites: [] },
    mode: 'onSubmit',
  });
  const selectedRoles = useWatch({ control: form.control, name: 'roles' });
  const selectedSites = useWatch({ control: form.control, name: 'sites' });
  const editing =
    sheet && sheet !== 'invite'
      ? members.find((member) => member.id === sheet)
      : null;

  useEffect(() => {
    if (!sheet) return;
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') setSheet(null);
    }
    window.addEventListener('keydown', keyboard);
    return () => {
      window.removeEventListener('keydown', keyboard);
      trigger.current?.focus();
    };
  }, [sheet]);

  function save(next: OrganisationMember[]) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event(changeEvent));
      return true;
    } catch {
      setMessage('Changes could not be saved. Please try again.');
      return false;
    }
  }

  function openInvite(button: HTMLButtonElement) {
    trigger.current = button;
    form.reset({ name: '', email: '', roles: ['worker'], sites: [] });
    setMessage('');
    setSheet('invite');
  }

  function openEdit(member: OrganisationMember, button: HTMLButtonElement) {
    trigger.current = button;
    form.reset({
      name: member.name,
      email: member.email,
      roles: member.roles,
      sites: member.sites,
    });
    setMessage('');
    setSheet(member.id);
  }

  function toggleRole(role: AuthRole, checked: boolean) {
    const current = form.getValues('roles');
    form.setValue(
      'roles',
      checked ? [...current, role] : current.filter((item) => item !== role),
      { shouldValidate: true },
    );
    form.clearErrors('roles');
  }

  function toggleSite(site: string, checked: boolean) {
    const current = form.getValues('sites');
    form.setValue(
      'sites',
      checked ? [...current, site] : current.filter((item) => item !== site),
      { shouldValidate: true },
    );
    form.clearErrors('sites');
  }

  function submit(values: MemberFields) {
    const name = values.name.trim();
    const email = values.email.trim().toLowerCase();
    if (sheet === 'invite' && name.length < 2) {
      form.setError('name', { message: 'Enter the person’s full name.' });
      return;
    }
    if (sheet === 'invite' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.setError('email', { message: 'Enter a valid email address.' });
      return;
    }
    if (
      sheet === 'invite' &&
      members.some((member) => member.email.toLowerCase() === email)
    ) {
      form.setError('email', {
        message: 'This email is already in the member list.',
      });
      return;
    }
    if (
      !values.roles.length ||
      !values.roles.every(
        (role) => organisationRoleSchema.safeParse(role).success,
      )
    ) {
      form.setError('roles', { message: 'Choose at least one role.' });
      return;
    }
    if (!values.roles.includes('organisation_admin') && !values.sites.length) {
      form.setError('sites', { message: 'Choose at least one assigned site.' });
      return;
    }
    if (
      editing &&
      editing.roles.includes('organisation_admin') &&
      !values.roles.includes('organisation_admin') &&
      members.filter(
        (member) =>
          member.status === 'active' &&
          member.roles.includes('organisation_admin'),
      ).length <= 1
    ) {
      form.setError('roles', {
        message: 'Keep at least one active Organisation Admin.',
      });
      return;
    }
    const next =
      sheet === 'invite'
        ? [
            ...members,
            {
              id: crypto.randomUUID(),
              name,
              email,
              roles: values.roles,
              sites: values.sites,
              status: 'invited' as const,
              lastActive: 'Not yet active',
            },
          ]
        : members.map((member) =>
            member.id === editing?.id
              ? { ...member, roles: values.roles, sites: values.sites }
              : member,
          );
    if (save(next)) {
      setSheet(null);
      setMessage(
        sheet === 'invite'
          ? 'Invitation added to pending members.'
          : 'Member access updated.',
      );
    }
  }

  function changeStatus(member: OrganisationMember) {
    if (
      member.status === 'active' &&
      member.roles.includes('organisation_admin') &&
      members.filter(
        (item) =>
          item.status === 'active' && item.roles.includes('organisation_admin'),
      ).length <= 1
    ) {
      setMessage('Keep at least one active Organisation Admin.');
      return;
    }
    const status: MemberStatus =
      member.status === 'inactive' ? 'active' : 'inactive';
    if (
      save(
        members.map((item) =>
          item.id === member.id ? { ...item, status } : item,
        ),
      )
    )
      setMessage(
        `${member.name} ${status === 'active' ? 'reactivated' : 'deactivated'}.`,
      );
  }

  const term = search.trim().toLowerCase();
  const filtered = members.filter(
    (member) =>
      (!term ||
        `${member.name} ${member.email}`.toLowerCase().includes(term)) &&
      (roleFilter === 'all' || member.roles.includes(roleFilter as AuthRole)) &&
      (siteFilter === 'all' ||
        member.sites.includes(siteFilter) ||
        (member.roles.includes('organisation_admin') &&
          siteFilter !== 'all')) &&
      (statusFilter === 'all' || member.status === statusFilter),
  );

  function actions(member: OrganisationMember) {
    return (
      <div className="organisation-user-actions">
        <Button
          variant="secondary"
          size="compact"
          icon={<PencilSimple size={16} aria-hidden="true" />}
          onClick={(event) => openEdit(member, event.currentTarget)}
        >
          Edit access
        </Button>
        <Button
          variant="tertiary"
          size="compact"
          onClick={() => changeStatus(member)}
        >
          {member.status === 'inactive' ? 'Reactivate' : 'Deactivate'}
        </Button>
      </div>
    );
  }

  return (
    <div className="organisation-users">
      <PageHeader
        title="Users & Roles"
        description="Manage people, workspace roles and site access."
        actions={
          <Button
            icon={<Plus size={18} aria-hidden="true" />}
            onClick={(event) => openInvite(event.currentTarget)}
          >
            Invite user
          </Button>
        }
      />
      <div className="organisation-users-filters">
        <SearchInput
          label="Search members"
          className="safira-control-compact"
          placeholder="Name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          label="Role"
          className="safira-control-compact"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="all">All roles</option>
          {roles.map((role) => (
            <option value={role} key={role}>
              {roleLabels[role]}
            </option>
          ))}
        </Select>
        <Select
          label="Site"
          className="safira-control-compact"
          value={siteFilter}
          onChange={(event) => setSiteFilter(event.target.value)}
        >
          <option value="all">All sites</option>
          {siteOptions.map((site) => (
            <option value={site.label} key={site.value}>
              {site.label}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          className="safira-control-compact"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>
      <p className="organisation-users-context">
        Role and site changes here are local to this workspace view.
      </p>
      <div className="organisation-users-summary">
        <span role="status">
          {filtered.length} of {members.length} members
        </span>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="organisation-users-message"
      >
        {message}
      </p>
      <div className="organisation-users-table-wrap safira-card-surface">
        <table className="organisation-users-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role(s)</th>
              <th>Assigned sites</th>
              <th>Status</th>
              <th>Last active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="organisation-user-identity">
                    <span aria-hidden="true">{initials(member.name)}</span>
                    <div>
                      <strong>{member.name}</strong>
                      <small>{member.email}</small>
                    </div>
                  </div>
                </td>
                <td>
                  {member.roles.map((role) => (
                    <MetadataLabel
                      key={role}
                      kind="role"
                      label={roleLabels[role]}
                      className="mr-2"
                    />
                  ))}
                </td>
                <td>
                  {member.roles.includes('organisation_admin')
                    ? 'All sites'
                    : member.sites.join(', ') || 'No sites'}
                </td>
                <td>
                  <MemberStatusLabel status={member.status} />
                </td>
                <td>{member.lastActive}</td>
                <td>{actions(member)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="organisation-users-cards">
        {filtered.map((member) => (
          <article key={member.id} className="safira-card-surface">
            <div className="organisation-user-card-head">
              <div className="organisation-user-identity">
                <span aria-hidden="true">{initials(member.name)}</span>
                <div>
                  <strong>{member.name}</strong>
                  <small>{member.email}</small>
                </div>
              </div>
              <MemberStatusLabel status={member.status} />
            </div>
            <dl>
              <div>
                <dt>Role(s)</dt>
                <dd>
                  {member.roles.map((role) => (
                    <MetadataLabel
                      key={role}
                      kind="role"
                      label={roleLabels[role]}
                      className="mr-2"
                    />
                  ))}
                </dd>
              </div>
              <div>
                <dt>Assigned sites</dt>
                <dd>
                  {member.roles.includes('organisation_admin')
                    ? 'All sites'
                    : member.sites.join(', ') || 'No sites'}
                </dd>
              </div>
              <div>
                <dt>Last active</dt>
                <dd>{member.lastActive}</dd>
              </div>
            </dl>
            {actions(member)}
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="organisation-users-empty grid gap-3 text-center">
          <IllustrationSlot illustrationKey="empty" decorative />
          <p>No members match these filters.</p>
        </div>
      )}
      {sheet && (
        <div className="organisation-user-modal-root">
          <button
            className="organisation-user-backdrop"
            aria-label="Close member sheet"
            onClick={() => setSheet(null)}
          />
          <section
            className="organisation-user-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="organisation-user-sheet-title"
          >
            <div className="organisation-user-sheet-head">
              <div>
                <p>{sheet === 'invite' ? 'New invitation' : 'Member access'}</p>
                <h2 id="organisation-user-sheet-title">
                  {sheet === 'invite'
                    ? 'Invite user'
                    : `Edit ${editing?.name || 'member'}`}
                </h2>
              </div>
              <button
                aria-label="Close member sheet"
                onClick={() => setSheet(null)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={form.handleSubmit(submit)} noValidate>
              {sheet === 'invite' ? (
                <div className="organisation-user-fields">
                  <Input
                    label="Full name"
                    autoFocus
                    {...form.register('name')}
                    error={form.formState.errors.name?.message}
                  />
                  <Input
                    label="Email address"
                    type="email"
                    {...form.register('email')}
                    error={form.formState.errors.email?.message}
                  />
                </div>
              ) : (
                <p className="organisation-user-edit-identity">
                  {editing?.email}
                </p>
              )}
              <fieldset>
                <legend>Workspace roles</legend>
                <p>Choose only the roles this person should hold.</p>
                <div className="organisation-user-choices">
                  {roles.map((role) => (
                    <label key={role}>
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role)}
                        onChange={(event) =>
                          toggleRole(role, event.target.checked)
                        }
                      />
                      {roleLabels[role]}
                    </label>
                  ))}
                </div>
                {form.formState.errors.roles && (
                  <span role="alert" className="organisation-user-error">
                    {form.formState.errors.roles.message}
                  </span>
                )}
              </fieldset>
              <fieldset>
                <legend>Assigned sites</legend>
                <p>
                  Organisation Admin has all-site scope. Other roles use
                  selected sites.
                </p>
                <div className="organisation-user-choices">
                  {siteOptions.map((site) => (
                    <label key={site.value}>
                      <input
                        type="checkbox"
                        checked={selectedSites.includes(site.label)}
                        disabled={selectedRoles.includes('organisation_admin')}
                        onChange={(event) =>
                          toggleSite(site.label, event.target.checked)
                        }
                      />
                      {site.label}
                    </label>
                  ))}
                </div>
                {form.formState.errors.sites && (
                  <span role="alert" className="organisation-user-error">
                    {form.formState.errors.sites.message}
                  </span>
                )}
              </fieldset>
              <div className="organisation-user-sheet-actions">
                <Button variant="secondary" onClick={() => setSheet(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {sheet === 'invite' ? 'Add invitation' : 'Save access'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
