'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/shell';
import { Input, Select } from '@/components/hse-officer/ui';
import { EmptyState } from '@/components/ui/feedback';
import {
  ChecklistStatusBadge,
  useChecklistReview,
} from '@/components/hse-officer/checklist-review';
import {
  checklistSubmissions,
  checklistDate,
  flaggedCount,
  type ChecklistSubmission,
} from '@/data/checklists';

export default function ChecklistsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [site, setSite] = useState('all');
  const [date, setDate] = useState('all');
  const { reviews } = useChecklistReview();
  const statusOf = (item: ChecklistSubmission) =>
    reviews[item.id] ? 'reviewed' : item.status;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(date));
  const items = checklistSubmissions
    .filter(
      (item) =>
        `${item.id} ${item.name} ${item.site} ${item.submittedBy}`
          .toLowerCase()
          .includes(search.toLowerCase().trim()) &&
        (status === 'all' || statusOf(item) === status) &&
        (site === 'all' || item.site === site) &&
        (date === 'all' || new Date(item.submittedAt) >= cutoff),
    )
    .sort(
      (a, b) =>
        Number(statusOf(b) === 'needs_review') -
          Number(statusOf(a) === 'needs_review') ||
        flaggedCount(b) - flaggedCount(a) ||
        b.submittedAt.localeCompare(a.submittedAt),
    );
  return (
    <div className="grid min-w-0 gap-4">
      <PageHeader
        title="Checklist submissions"
        description="Review checklist submissions for your permitted sites."
      />
      <div className="officer-checklist-filters grid grid-cols-2 gap-3 xl:grid-cols-[2fr_1fr_1fr_1fr]">
        <Input
          label="Search checklists"
          placeholder="Checklist, site or submitter…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="needs_review">Needs review</option>
          <option value="reviewed">Reviewed</option>
        </Select>
        <Select
          label="Site"
          value={site}
          onChange={(event) => setSite(event.target.value)}
        >
          <option value="all">All sites</option>
          {Array.from(
            new Set(checklistSubmissions.map((item) => item.site)),
          ).map((name) => (
            <option key={name}>{name}</option>
          ))}
        </Select>
        <Select
          label="Date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        >
          <option value="all">All dates</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </Select>
      </div>
      <p className="text-xs text-graphite" role="status">
        {items.length} submissions · Needs review and flagged issues first
      </p>
      {!items.length ? (
        <EmptyState
          title="No matching submissions"
          description="Try another search or change your filters."
        />
      ) : (
        <>
          <div className="hidden rounded-lg border border-graphite/20 bg-white xl:block">
            <table className="w-full table-fixed text-left text-xs">
              <caption className="sr-only">
                Checklist submissions for permitted sites
              </caption>
              <thead className="bg-coolSurface">
                <tr>
                  {[
                    'Checklist',
                    'Site',
                    'Submitted by',
                    'Date / time',
                    'Status',
                    'Flagged issues',
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-3 py-2 font-semibold text-deepCharcoal"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-graphite/10 hover:bg-coolSurface/50"
                  >
                    <td className="break-words px-3 py-3">
                      <Link
                        className="font-semibold underline decoration-graphite/20 underline-offset-4 focus-visible:outline-2 focus-visible:outline-information"
                        href={`/hse-officer/checklists/${item.id}`}
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-graphite/60">{item.id}</p>
                    </td>
                    <td className="break-words px-3 py-3">{item.site}</td>
                    <td className="break-words px-3 py-3">
                      {item.submittedBy}
                    </td>
                    <td className="px-3 py-3">
                      <time dateTime={item.submittedAt}>
                        {checklistDate(item.submittedAt)}
                      </time>
                    </td>
                    <td className="px-3 py-3">
                      <ChecklistStatusBadge status={statusOf(item)} />
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          flaggedCount(item)
                            ? 'font-semibold text-critical'
                            : 'text-graphite'
                        }
                      >
                        {flaggedCount(item)} flagged
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-2 xl:hidden">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/hse-officer/checklists/${item.id}`}
                className="grid min-w-0 gap-2 rounded-lg border border-graphite/20 bg-white p-3 hover:border-graphite/40 focus-visible:outline-2 focus-visible:outline-information"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold">{item.name}</h2>
                  <ChecklistStatusBadge status={statusOf(item)} />
                </div>
                <p className="break-words text-xs text-graphite">
                  {item.id} · {item.site}
                </p>
                <p className="text-xs">Submitted by {item.submittedBy}</p>
                <div className="flex flex-wrap justify-between gap-2 text-xs">
                  <time dateTime={item.submittedAt}>
                    {checklistDate(item.submittedAt)}
                  </time>
                  <span
                    className={
                      flaggedCount(item) ? 'font-semibold text-critical' : ''
                    }
                  >
                    {flaggedCount(item)} flagged issues
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
