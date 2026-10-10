import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';
import {
  checklistDate,
  flaggedCount,
  type ChecklistStatus,
  type ChecklistSubmission,
} from '@/data/checklists';
import { ChecklistStatusLabel } from './checklist-review';

export function ChecklistSubmissionCard({
  submission,
  status,
}: {
  submission: ChecklistSubmission;
  status: ChecklistStatus;
}) {
  const flagged = flaggedCount(submission);

  return (
    <Link
      href={`/hse-officer/checklists/${submission.id}`}
      className="report-card safira-card-surface safira-card-action group"
      aria-label={`Open checklist submission ${submission.id}: ${submission.name}`}
    >
      <div className="grid min-w-0 gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-snug text-deepCharcoal">
            {submission.name}
          </h2>
          <p className="mt-1 break-words text-xs text-graphite/75">
            <span className="font-mono">{submission.id}</span> ·{' '}
            {submission.site}
          </p>
        </div>
        <div className="grid gap-0.5 text-xs text-graphite/75">
          <span>Submitted by {submission.submittedBy}</span>
          <time dateTime={submission.submittedAt}>
            {checklistDate(submission.submittedAt)}
          </time>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-graphite/10 pt-2 text-xs lg:justify-end lg:border-0 lg:pt-0">
          <span
            className={
              flagged ? 'font-semibold text-critical' : 'text-graphite/75'
            }
          >
            {flagged} flagged {flagged === 1 ? 'issue' : 'issues'}
          </span>
          <ChecklistStatusLabel status={status} />
          <ArrowRight
            size={16}
            className="text-graphite/60 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}
