'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  WarningCircle,
  CheckCircle,
  Image as ImageIcon,
  LinkSimple,
} from '@phosphor-icons/react';
import { Button } from '@/components/hse-officer/ui';
import { Card, EmptyState } from '@/components/ui/feedback';
import {
  ChecklistStatusBadge,
  useChecklistReview,
} from '@/components/hse-officer/checklist-review';
import {
  checklistSubmissions,
  checklistDate,
  type ChecklistResponse,
} from '@/data/checklists';
import { reportList } from '@/data/reports';

function Evidence({ response }: { response: ChecklistResponse }) {
  return response.evidence?.length ? (
    <div className="grid gap-2">
      {response.evidence.map((file) =>
        file.url ? (
          <a
            key={file.name}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs underline"
          >
            <Image
              src={file.url}
              alt={file.name}
              width={360}
              height={240}
              unoptimized
              className="mb-2 h-auto max-w-full rounded-md"
            />
            {file.name}
          </a>
        ) : (
          <div
            key={file.name}
            className="flex items-start gap-2 rounded-md border border-graphite/10 bg-coolSurface p-3 text-xs"
          >
            <ImageIcon size={20} aria-hidden="true" className="shrink-0" />
            <div className="min-w-0 break-words">
              <p className="font-medium">{file.name}</p>
              <p className="mt-1 text-graphite/70">Photo preview unavailable</p>
            </div>
          </div>
        ),
      )}
    </div>
  ) : (
    <p className="text-xs text-graphite/70">No evidence attached</p>
  );
}
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
  return (
    <div className="grid min-w-0 gap-4 text-graphite">
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
        <ChecklistStatusBadge status={status} />
      </header>
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="grid min-w-0 gap-3">
          <Card title="Submission details">
            <dl className="grid grid-cols-[100px_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs">
              <dt>Checklist</dt>
              <dd>{submission.name}</dd>
              <dt>Site</dt>
              <dd>{submission.site}</dd>
              <dt>Submitted by</dt>
              <dd>{submission.submittedBy}</dd>
              <dt>Date / time</dt>
              <dd>{checklistDate(submission.submittedAt)}</dd>
              <dt>Status</dt>
              <dd>
                <ChecklistStatusBadge status={status} />
              </dd>
            </dl>
          </Card>
          <Card title="Responses">
            <ul className="divide-y divide-graphite/10">
              {submission.responses.map((response) => (
                <li
                  key={response.id}
                  className="grid gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-2">
                    {response.flagged ? (
                      <WarningCircle
                        size={18}
                        className="shrink-0 text-critical"
                        aria-label="Flagged item"
                      />
                    ) : (
                      <CheckCircle
                        size={18}
                        className="shrink-0 text-success"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold">
                        {response.question}
                      </h3>
                      <p
                        className={`mt-1 break-words text-xs ${response.flagged ? 'font-semibold text-critical' : ''}`}
                      >
                        {response.type === 'checkbox' && (
                          <span aria-hidden="true">☑ </span>
                        )}
                        {response.answer}
                      </p>
                    </div>
                  </div>
                  {response.note && (
                    <p className="text-xs leading-5">Note: {response.note}</p>
                  )}
                  {response.type === 'photo' && (
                    <Evidence response={response} />
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="grid min-w-0 gap-3">
          <section
            className={`grid gap-3 rounded-lg border p-3 ${flagged.length ? 'border-critical/20 bg-white' : 'border-graphite/20 bg-white'}`}
          >
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <WarningCircle
                size={18}
                className={flagged.length ? 'text-critical' : 'text-graphite'}
              />
              Flagged items ({flagged.length})
            </h2>
            {flagged.length ? (
              flagged.map((response) => (
                <article
                  key={response.id}
                  className="grid gap-2 border-t border-critical/10 pt-3 text-xs"
                >
                  <h3 className="font-semibold">{response.question}</h3>
                  <p>
                    <span className="font-medium">Response:</span>{' '}
                    {response.answer}
                  </p>
                  <p>
                    <span className="font-medium">Note:</span>{' '}
                    {response.note || 'No note provided'}
                  </p>
                  <Evidence response={response} />
                  {response.reportId && (
                    <Link
                      className="officer-link font-semibold"
                      href={`/hse-officer/reports/${response.reportId}`}
                    >
                      Linked report {response.reportId}
                    </Link>
                  )}
                </article>
              ))
            ) : (
              <p className="text-xs">No flagged issues in this submission.</p>
            )}
          </section>
          <section className="grid gap-2 rounded-lg border border-information/20 bg-information/5 p-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <LinkSimple size={18} />
              Linked reports
            </h2>
            {linked.length ? (
              linked.map((reportId) => (
                <div key={reportId}>
                  <Link
                    href={`/hse-officer/reports/${reportId}`}
                    className="officer-link font-semibold"
                  >
                    {reportId} ·{' '}
                    {reportList.find((report) => report.id === reportId)
                      ?.title || 'View report'}
                  </Link>
                  <p className="mt-1 text-xs">
                    Linked to submission {submission.id} and the flagged
                    question above.
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs">No reports linked to this submission.</p>
            )}
          </section>
          <Card title="HSE Officer review">
            <p className="text-xs leading-5">
              {status === 'reviewed'
                ? 'This submission has been reviewed. Linked reports retain their own status.'
                : 'Review the responses, flagged issues and linked reports before marking this submission reviewed.'}
            </p>
            {reviews[id] && (
              <p className="text-xs">Reviewed {checklistDate(reviews[id])}</p>
            )}
            <Button
              disabled={status === 'reviewed'}
              onClick={() => {
                setError(
                  markReviewed(id)
                    ? null
                    : 'Could not save your review. Please try again.',
                );
              }}
            >
              {status === 'reviewed' ? 'Reviewed' : 'Mark as reviewed'}
            </Button>
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
