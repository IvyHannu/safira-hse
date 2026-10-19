'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  LinkSimple,
  WarningCircle,
} from '@phosphor-icons/react';
import { Button } from '@/components/hse-officer/ui';
import { Card, EmptyState } from '@/components/ui/feedback';
import {
  ChecklistStatusLabel,
  useChecklistReview,
} from '@/components/hse-officer/checklist-review';
import { ChecklistResponseRow } from '@/components/hse-officer/checklist-response-row';
import { checklistSubmissions, checklistDate } from '@/data/checklists';
import { reportList } from '@/data/reports';

export default function ChecklistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const submission = checklistSubmissions.find((item) => item.id === id);
  const { reviews, markReviewed } = useChecklistReview();
  const [error, setError] = useState<string | null>(null);

  if (!submission)
    return (
      <EmptyState
        title="Checklist submission not found"
        description="Return to submissions to choose an available checklist."
        action={
          <Link href="/hse-officer/checklists" className="underline">
            Back to submissions
          </Link>
        }
      />
    );

  const status = reviews[id] ? 'reviewed' : submission.status;
  const flagged = submission.responses.filter((response) => response.flagged);
  const linked = Array.from(
    new Set(
      submission.responses
        .map((response) => response.reportId)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const evidenceOwner = new Map<string, string>();
  for (const response of [
    ...flagged,
    ...submission.responses.filter((item) => !item.flagged),
  ]) {
    for (const file of response.evidence ?? []) {
      const key = `${file.name}:${file.url ?? ''}`;
      if (!evidenceOwner.has(key)) evidenceOwner.set(key, response.id);
    }
  }

  return (
    <div className="grid min-w-0 gap-3 text-graphite md:gap-4">
      <Link
        href="/hse-officer/checklists"
        className="inline-flex min-h-10 w-fit items-center gap-2 text-xs font-medium hover:underline"
      >
        <ArrowLeft size={16} />
        Back to submissions
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-deepCharcoal">
            {submission.name}
          </h1>
          <p className="mt-1 text-xs">
            {submission.id} · Submitted {checklistDate(submission.submittedAt)}{' '}
            by {submission.submittedBy}
          </p>
        </div>
        <ChecklistStatusLabel status={status} />
      </header>
      <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[1.15fr_1fr] lg:gap-4">
        <div className="grid min-w-0 gap-2 md:gap-3">
          <Card title="Submission details" compact>
            <dl className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs leading-5">
              <dt className="text-graphite/70">Site</dt>
              <dd className="min-w-0 break-words font-medium text-deepCharcoal">
                {submission.site}
              </dd>
              <dt className="text-graphite/70">Submitted by</dt>
              <dd className="min-w-0 break-words font-medium text-deepCharcoal">
                {submission.submittedBy}
              </dd>
              <dt className="text-graphite/70">Date / time</dt>
              <dd className="font-medium text-deepCharcoal">
                <time dateTime={submission.submittedAt}>
                  {checklistDate(submission.submittedAt)}
                </time>
              </dd>
            </dl>
          </Card>
          <Card title="Responses" compact>
            <ul className="divide-y divide-graphite/10">
              {submission.responses.map((response) => (
                <li key={response.id}>
                  <ChecklistResponseRow
                    response={response}
                    evidence={response.evidence?.filter(
                      (file) =>
                        evidenceOwner.get(`${file.name}:${file.url ?? ''}`) ===
                        response.id,
                    )}
                  />
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="grid min-w-0 gap-2 md:gap-3">
          <Card
            title={`Flagged items (${flagged.length})`}
            compact
            icon={
              <WarningCircle
                size={18}
                className={flagged.length ? 'text-critical' : 'text-graphite'}
              />
            }
          >
            {flagged.length ? (
              <div className="divide-y divide-graphite/10 text-xs">
                {flagged.map((response) => (
                  <a
                    key={response.id}
                    href={`#response-${response.id}`}
                    className="group flex min-h-11 items-center justify-between gap-3 py-2 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-signalYellow"
                  >
                    <span className="min-w-0 font-semibold text-deepCharcoal group-hover:underline">
                      {response.question}
                    </span>
                    <span className="shrink-0 text-critical">
                      {response.answer}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs">No flagged issues in this submission.</p>
            )}
          </Card>
          <Card title="Linked reports" icon={<LinkSimple size={18} />} compact>
            {linked.length ? (
              <div className="grid gap-2">
                {linked.map((reportId) => (
                  <div key={reportId}>
                    <Link
                      href={`/hse-officer/reports/${reportId}`}
                      className="officer-link font-semibold"
                    >
                      {reportId} ·{' '}
                      {reportList.find((report) => report.id === reportId)
                        ?.title || 'View report'}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p>No reports linked to this submission.</p>
            )}
          </Card>
          <Card
            title="HSE Officer review"
            icon={<CheckCircle size={18} />}
            compact
          >
            <p className="text-xs leading-5">
              {status === 'reviewed'
                ? 'Linked reports retain their own status.'
                : 'Review the responses, flagged issues and linked reports before marking this submission reviewed.'}
            </p>
            {status === 'reviewed' ? (
              <p className="flex items-center gap-2 text-xs font-medium text-success">
                <CheckCircle size={18} aria-hidden="true" />
                Review complete
                {reviews[id] ? ` · ${checklistDate(reviews[id])}` : ''}
              </p>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  setError(
                    markReviewed(id)
                      ? null
                      : 'Could not save your review. Please try again.',
                  );
                }}
              >
                Mark as reviewed
              </Button>
            )}
            {error && (
              <p role="alert" className="text-xs text-critical">
                {error}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
