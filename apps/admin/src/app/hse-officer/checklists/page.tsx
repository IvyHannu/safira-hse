'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/shell';
import { Select } from '@/components/hse-officer/ui';
import { SearchInput } from '@/components/ui/forms';
import { EmptyState } from '@/components/ui/feedback';
import { ChecklistSubmissionCard } from '@/components/hse-officer/checklist-submission-card';
import { useChecklistReview } from '@/components/hse-officer/checklist-review';
import {
  checklistSubmissions,
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
      <div className="officer-checklist-filters grid min-w-0 gap-2.5 sm:grid-cols-2 xl:grid-cols-[minmax(220px,2fr)_repeat(3,minmax(150px,1fr))] xl:items-end">
        <SearchInput
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
        {items.length} {items.length === 1 ? 'submission' : 'submissions'} ·
        Needs review and flagged issues first
      </p>
      {!items.length ? (
        <EmptyState
          title="No matching submissions"
          description="Try another search or change your filters."
          illustrationKey="noResults"
        />
      ) : (
        <div className="grid min-w-0 gap-2.5">
          {items.map((item) => (
            <ChecklistSubmissionCard
              key={item.id}
              submission={item}
              status={statusOf(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
