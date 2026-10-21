'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Check, PencilSimple, ShieldCheck, X } from '@phosphor-icons/react';
import { ActionGroup, Button, ButtonLink } from '@/components/ui/button';
import { SearchInput, Select } from '@/components/ui/forms';
import { MetadataLabel } from '@/components/ui/report-metadata';
import { IllustrationSlot } from '@/components/ui/illustration-slot';
import { PageHeader } from '@/components/ui/shell';
import {
  initialAccessRequests,
  type AccessRequest,
} from '@/data/organisation-access';
import {
  initialOrganisationMembers,
  roleLabels,
  type OrganisationMember,
} from '@/data/organisation-users';
import { initialOrganisationSites } from '@/data/organisation-sites';
import './organisation-access.css';

const membersKey = 'safira.organisation.members.v1';
const sitesKey = 'safira.organisation.sites.v1';
const requestsKey = 'safira.organisation.access-requests.v1';
const membersEvent = 'safira-organisation-members';
const requestsEvent = 'safira-organisation-access-requests';

const roleSummaries = [
  {
    role: 'Worker',
    access: 'Own reports, assigned checklists and worker-facing updates',
    scope: 'Assigned sites and owned records',
  },
  {
    role: 'HSE Officer',
    access:
      'Review reports and checklist submissions; assess and resolve reports',
    scope: 'Permitted sites',
  },
  {
    role: 'HSE Admin',
    access: 'HSE review plus checklist, reporting and HSE setup management',
    scope: 'Permitted organisation scope',
  },
  {
    role: 'Organisation Admin',
    access: 'Organisation, members, roles, sites and settings',
    scope: 'Organisation governance',
  },
] as const;

type ProposedChange =
  | { kind: 'sites'; member: OrganisationMember; sites: string[] }
  | {
      kind: 'status';
      member: OrganisationMember;
      status: 'active' | 'inactive';
    }
  | {
      kind: 'request';
      request: AccessRequest;
      decision: 'approved' | 'declined';
    };

function subscribe(callback: () => void) {
  for (const event of [
    'storage',
    membersEvent,
    requestsEvent,
    'safira-organisation-sites',
  ])
    window.addEventListener(event, callback);
  return () => {
    for (const event of [
      'storage',
      membersEvent,
      requestsEvent,
      'safira-organisation-sites',
    ])
      window.removeEventListener(event, callback);
  };
}

function readArray<T>(
  value: string | null,
  fallback: T[],
  valid: (record: T) => boolean,
): T[] {
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((record): record is T => valid(record as T))
      : fallback;
  } catch {
    return fallback;
  }
}

function readMembers(value: string | null) {
  return readArray(
    value,
    initialOrganisationMembers,
    (member) =>
      !!member &&
      typeof member.id === 'string' &&
      typeof member.name === 'string' &&
      Array.isArray(member.roles) &&
      Array.isArray(member.sites) &&
      ['active', 'inactive', 'invited'].includes(member.status),
  );
}
function readSites(value: string | null) {
  return readArray(
    value,
    initialOrganisationSites,
    (site) =>
      !!site &&
      typeof site.id === 'string' &&
      typeof site.name === 'string' &&
      ['active', 'inactive', 'archived'].includes(site.status),
  );
}
function readRequests(value: string | null) {
  return readArray(
    value,
    initialAccessRequests,
    (request) =>
      !!request &&
      typeof request.id === 'string' &&
      typeof request.memberId === 'string' &&
      typeof request.site === 'string' &&
      ['pending', 'approved', 'declined'].includes(request.status),
  );
}

export function OrganisationAccess() {
  const serialized = useSyncExternalStore(
    subscribe,
    () =>
      JSON.stringify([
        window.localStorage.getItem(membersKey),
        window.localStorage.getItem(sitesKey),
        window.localStorage.getItem(requestsKey),
      ]),
    () => '[null,null,null]',
  );
  const [memberValue, siteValue, requestValue] = JSON.parse(serialized) as [
    string | null,
    string | null,
    string | null,
  ];
  const members = useMemo(() => readMembers(memberValue), [memberValue]);
  const sites = useMemo(
    () => readSites(siteValue).filter((site) => site.status === 'active'),
    [siteValue],
  );
  const requests = useMemo(() => readRequests(requestValue), [requestValue]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [selectedMember, setSelectedMember] =
    useState<OrganisationMember | null>(null);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [proposal, setProposal] = useState<ProposedChange | null>(null);
  const [message, setMessage] = useState('');
  const trigger = useRef<HTMLButtonElement | null>(null);

  const visibleMembers = members.filter(
    (member) =>
      (role === 'all' ||
        member.roles.includes(role as OrganisationMember['roles'][number])) &&
      `${member.name} ${member.email} ${member.sites.join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const pendingRequests = requests.filter(
    (request) => request.status === 'pending',
  );
  const pendingInvites = members.filter(
    (member) => member.status === 'invited',
  );

  useEffect(() => {
    if (!selectedMember && !proposal) return;
    document
      .querySelector<HTMLElement>(
        proposal
          ? '.organisation-access-confirm button'
          : '.organisation-access-sheet button',
      )
      ?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProposal(null);
        setSelectedMember(null);
      }
      if (event.key === 'Tab') {
        const dialog = document.querySelector<HTMLElement>(
          proposal
            ? '.organisation-access-confirm'
            : '.organisation-access-sheet',
        );
        const controls = Array.from(
          dialog?.querySelectorAll<HTMLElement>(
            'button:not(:disabled),input:not(:disabled)',
          ) || [],
        );
        if (!controls.length) return;
        if (event.shiftKey && document.activeElement === controls[0]) {
          event.preventDefault();
          controls[controls.length - 1].focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === controls[controls.length - 1]
        ) {
          event.preventDefault();
          controls[0].focus();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      trigger.current?.focus();
    };
  }, [selectedMember, proposal]);

  function openMember(member: OrganisationMember, button: HTMLButtonElement) {
    trigger.current = button;
    setSelectedSites(member.sites);
    setSelectedMember(member);
    setMessage('');
  }

  function proposeSites() {
    if (!selectedMember) return;
    if (
      selectedSites.length === selectedMember.sites.length &&
      selectedSites.every((site) => selectedMember.sites.includes(site))
    ) {
      setSelectedMember(null);
      return;
    }
    if (
      !selectedMember.roles.includes('organisation_admin') &&
      selectedSites.length === 0
    ) {
      setMessage('Choose at least one site for this member.');
      return;
    }
    setProposal({
      kind: 'sites',
      member: selectedMember,
      sites: selectedSites,
    });
  }

  function confirm() {
    if (!proposal) return;
    let nextMembers = members;
    let nextRequests = requests;
    let success = '';
    if (proposal.kind === 'sites') {
      nextMembers = members.map((member) =>
        member.id === proposal.member.id
          ? { ...member, sites: proposal.sites }
          : member,
      );
      success = `Site access updated for ${proposal.member.name}.`;
    } else if (proposal.kind === 'status') {
      if (
        proposal.status === 'inactive' &&
        proposal.member.roles.includes('organisation_admin') &&
        members.filter(
          (member) =>
            member.status === 'active' &&
            member.roles.includes('organisation_admin'),
        ).length <= 1
      ) {
        setMessage('At least one active Organisation Admin must remain.');
        setProposal(null);
        return;
      }
      nextMembers = members.map((member) =>
        member.id === proposal.member.id
          ? { ...member, status: proposal.status }
          : member,
      );
      success = `${proposal.member.name} is now ${proposal.status}.`;
    } else {
      nextRequests = requests.map((request) =>
        request.id === proposal.request.id
          ? { ...request, status: proposal.decision }
          : request,
      );
      const member = members.find(
        (item) => item.id === proposal.request.memberId,
      );
      if (
        proposal.decision === 'approved' &&
        member &&
        !member.sites.includes(proposal.request.site)
      ) {
        nextMembers = members.map((item) =>
          item.id === member.id
            ? { ...item, sites: [...item.sites, proposal.request.site] }
            : item,
        );
      }
      success = `Access request ${proposal.decision}.`;
    }
    try {
      if (nextMembers !== members)
        window.localStorage.setItem(membersKey, JSON.stringify(nextMembers));
      if (nextRequests !== requests)
        window.localStorage.setItem(requestsKey, JSON.stringify(nextRequests));
      if (nextMembers !== members)
        window.dispatchEvent(new Event(membersEvent));
      if (nextRequests !== requests)
        window.dispatchEvent(new Event(requestsEvent));
      setMessage(success);
      setProposal(null);
      setSelectedMember(null);
    } catch {
      setMessage('Could not save this change. Please try again.');
    }
  }

  const confirmation =
    proposal?.kind === 'sites'
      ? {
          title: 'Confirm site access change',
          text: `Update ${proposal.member.name} to ${proposal.sites.length} assigned ${proposal.sites.length === 1 ? 'site' : 'sites'}? Removed sites will no longer appear in this member’s assigned access.`,
          action: 'Confirm site access',
        }
      : proposal?.kind === 'status'
        ? {
            title: `Confirm ${proposal.status === 'active' ? 'activation' : 'deactivation'}`,
            text: `${proposal.member.name} will be marked ${proposal.status} in organisation access records.`,
            action:
              proposal.status === 'active'
                ? 'Activate access'
                : 'Deactivate access',
          }
        : proposal
          ? {
              title: `Confirm request ${proposal.decision === 'approved' ? 'approval' : 'decline'}`,
              text: `${members.find((member) => member.id === proposal.request.memberId)?.name || 'This member'} ${proposal.decision === 'approved' ? 'will be assigned' : 'will not be assigned'} to ${proposal.request.site}.`,
              action:
                proposal.decision === 'approved'
                  ? 'Approve access'
                  : 'Decline request',
            }
          : null;

  return (
    <div className="organisation-access">
      <PageHeader
        title="Access / Permissions"
        description="Review roles, site assignments and pending organisation access."
      />
      <section className="organisation-access-panel safira-card-surface">
        <div className="organisation-access-heading">
          <h2>Role permissions</h2>
          <p>System role overview</p>
        </div>
        <div className="organisation-access-role-list">
          {roleSummaries.map((item) => (
            <div key={item.role}>
              <strong>{item.role}</strong>
              <span>{item.access}</span>
              <small>{item.scope}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="organisation-access-panel safira-card-surface">
        <div className="organisation-access-heading">
          <h2>Member site access</h2>
          <p>
            Manage site assignments and active access for organisation members.
          </p>
        </div>
        <div className="organisation-access-filters">
          <SearchInput
            className="safira-control-compact"
            label="Search members"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email or site"
          />
          <Select
            className="safira-control-compact"
            label="Role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="all">All roles</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="organisation-access-table-wrap">
          <table className="organisation-access-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Assigned sites</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>{member.name}</strong>
                    <small>{member.email}</small>
                  </td>
                  <td>
                    {member.roles.map((item) => roleLabels[item]).join(', ')}
                  </td>
                  <td>
                    {member.sites.length
                      ? member.sites.join(', ')
                      : 'Organisation-wide'}
                  </td>
                  <td>
                    <MetadataLabel
                      kind="status"
                      tone={
                        member.status === 'active'
                          ? 'success'
                          : member.status === 'invited'
                            ? 'information'
                            : 'neutral'
                      }
                      label={member.status}
                    />
                  </td>
                  <td>
                    <ActionGroup>
                      {!member.roles.includes('organisation_admin') && (
                        <Button
                          size="compact"
                          variant="secondary"
                          icon={<PencilSimple size={16} />}
                          onClick={(event) =>
                            openMember(member, event.currentTarget)
                          }
                        >
                          Site access
                        </Button>
                      )}
                      {member.status !== 'invited' && (
                        <Button
                          size="compact"
                          variant={
                            member.status === 'active'
                              ? 'destructive-outline'
                              : 'positive-outline'
                          }
                          onClick={() =>
                            setProposal({
                              kind: 'status',
                              member,
                              status:
                                member.status === 'active'
                                  ? 'inactive'
                                  : 'active',
                            })
                          }
                        >
                          {member.status === 'active'
                            ? 'Deactivate'
                            : 'Activate'}
                        </Button>
                      )}
                    </ActionGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleMembers.length === 0 && (
            <div className="organisation-access-empty grid gap-3 text-center">
              <IllustrationSlot illustrationKey="noResults" decorative />
              <p>No members match these filters.</p>
            </div>
          )}
        </div>
        <div className="organisation-access-cards">
          {visibleMembers.map((member) => (
            <article key={member.id} className="safira-card-surface">
              <div>
                <strong>{member.name}</strong>
                <MetadataLabel
                  kind="status"
                  tone={
                    member.status === 'active'
                      ? 'success'
                      : member.status === 'invited'
                        ? 'information'
                        : 'neutral'
                  }
                  label={member.status}
                />
              </div>
              <small>{member.email}</small>
              <p>{member.roles.map((item) => roleLabels[item]).join(', ')}</p>
              <p>
                {member.sites.length
                  ? member.sites.join(', ')
                  : 'Organisation-wide'}
              </p>
              <ActionGroup>
                {!member.roles.includes('organisation_admin') && (
                  <Button
                    size="compact"
                    variant="secondary"
                    icon={<PencilSimple size={16} />}
                    onClick={(event) => openMember(member, event.currentTarget)}
                  >
                    Site access
                  </Button>
                )}
                {member.status !== 'invited' && (
                  <Button
                    size="compact"
                    variant={
                      member.status === 'active'
                        ? 'destructive-outline'
                        : 'positive-outline'
                    }
                    onClick={() =>
                      setProposal({
                        kind: 'status',
                        member,
                        status:
                          member.status === 'active' ? 'inactive' : 'active',
                      })
                    }
                  >
                    {member.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                )}
              </ActionGroup>
            </article>
          ))}
        </div>
      </section>
      <div className="organisation-access-bottom">
        <section className="organisation-access-panel safira-card-surface">
          <div className="organisation-access-heading">
            <h2>
              Pending invitations <span>{pendingInvites.length}</span>
            </h2>
            <p>Members waiting to join the organisation.</p>
          </div>
          {pendingInvites.length ? (
            pendingInvites.map((member) => (
              <div className="organisation-access-pending" key={member.id}>
                <div>
                  <strong>{member.name}</strong>
                  <small>{member.email}</small>
                  <small>
                    {member.roles.map((item) => roleLabels[item]).join(', ')} ·{' '}
                    {member.sites.join(', ')}
                  </small>
                </div>
                <MetadataLabel
                  kind="status"
                  tone="information"
                  label="Invited"
                />
              </div>
            ))
          ) : (
            <div className="organisation-access-empty grid justify-items-center gap-2 text-center">
              <IllustrationSlot
                illustrationKey="empty"
                decorative
                className="max-w-20"
              />
              <p>No pending invitations.</p>
            </div>
          )}
          <div className="organisation-access-link">
            <ButtonLink href="/organisation-admin/users" size="compact">
              Manage invitations in Users & Roles
            </ButtonLink>
          </div>
        </section>
        <section className="organisation-access-panel safira-card-surface">
          <div className="organisation-access-heading">
            <h2>
              Access requests <span>{pendingRequests.length}</span>
            </h2>
            <p>Review requested site assignments.</p>
          </div>
          {pendingRequests.length ? (
            pendingRequests.map((request) => {
              const member = members.find(
                (item) => item.id === request.memberId,
              );
              return (
                <div className="organisation-access-pending" key={request.id}>
                  <div>
                    <strong>{member?.name || 'Member unavailable'}</strong>
                    <small>
                      {request.site} · {request.requestedAt}
                    </small>
                    <MetadataLabel
                      kind="status"
                      tone="warning"
                      label="Pending"
                    />
                  </div>
                  <ActionGroup>
                    <Button
                      size="compact"
                      variant="primary"
                      icon={<Check size={16} />}
                      onClick={() =>
                        setProposal({
                          kind: 'request',
                          request,
                          decision: 'approved',
                        })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="compact"
                      variant="destructive-tertiary"
                      onClick={() =>
                        setProposal({
                          kind: 'request',
                          request,
                          decision: 'declined',
                        })
                      }
                    >
                      Decline
                    </Button>
                  </ActionGroup>
                </div>
              );
            })
          ) : (
            <div className="organisation-access-empty grid justify-items-center gap-2 text-center">
              <IllustrationSlot
                illustrationKey="empty"
                decorative
                className="max-w-20"
              />
              <p>No pending access requests.</p>
            </div>
          )}
        </section>
      </div>
      {message && (
        <p className="organisation-access-message" role="status">
          {message}
        </p>
      )}
      {selectedMember && !proposal && (
        <div
          className="organisation-access-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedMember(null);
          }}
        >
          <section
            className="organisation-access-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="access-sheet-title"
          >
            <header>
              <div>
                <h2 id="access-sheet-title">Site access</h2>
                <p>
                  {selectedMember.name} ·{' '}
                  {selectedMember.roles
                    .map((item) => roleLabels[item])
                    .join(', ')}
                </p>
              </div>
              <button
                aria-label="Close site access"
                onClick={() => setSelectedMember(null)}
              >
                <X size={20} />
              </button>
            </header>
            <div className="organisation-access-sheet-body">
              {sites.map((site) => (
                <label key={site.id}>
                  <input
                    type="checkbox"
                    checked={selectedSites.includes(site.name)}
                    onChange={(event) => {
                      setSelectedSites((current) =>
                        event.target.checked
                          ? [...current, site.name]
                          : current.filter((name) => name !== site.name),
                      );
                      setMessage('');
                    }}
                  />
                  <span>
                    <strong>{site.name}</strong>
                    <small>{site.location}</small>
                  </span>
                </label>
              ))}
            </div>
            {message && (
              <p className="organisation-access-sheet-error" role="alert">
                {message}
              </p>
            )}
            <footer>
              <Button
                variant="tertiary"
                onClick={() => setSelectedMember(null)}
              >
                Cancel
              </Button>
              <Button onClick={proposeSites}>Review change</Button>
            </footer>
          </section>
        </div>
      )}
      {proposal && confirmation && (
        <div className="organisation-access-backdrop">
          <section
            className="organisation-access-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="access-confirm-title"
            aria-describedby="access-confirm-text"
          >
            <ShieldCheck size={24} aria-hidden="true" />
            <h2 id="access-confirm-title">{confirmation.title}</h2>
            <p id="access-confirm-text">{confirmation.text}</p>
            <footer>
              <Button variant="secondary" onClick={() => setProposal(null)}>
                Cancel
              </Button>
              <Button
                onClick={confirm}
                variant={
                  proposal.kind === 'status' && proposal.status === 'inactive'
                    ? 'destructive-outline'
                    : proposal.kind === 'request' &&
                        proposal.decision === 'declined'
                      ? 'destructive-tertiary'
                      : 'primary'
                }
              >
                {confirmation.action}
              </Button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
