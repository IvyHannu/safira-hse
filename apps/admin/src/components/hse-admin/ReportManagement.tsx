'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  FileText,
  Lock,
  ChatCircle,
  Shield,
  Clock,
  Image as ImageIcon,
} from '@phosphor-icons/react';
import {
  hseClassificationSchema,
  reportSeveritySchema,
  reportStatusSchema,
} from '@safira/validation';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/forms';
import {
  ReportSeverityLabel,
  ReportStatusLabel,
  ReportTypeLabel,
} from '@/components/ui/report-metadata';
import {
  type ReportDetail,
  type ReportType,
  type Severity,
  type Status,
  typeOptions,
  severityOptions,
  statusOptions,
  assigneeOptions,
} from '@/data/reports';
import './report-management.css';

type Assessment = {
  classification: ReportType;
  severity: Severity;
  assignee: string;
  status: Status;
};
type RecordedAction = {
  title: string;
  assignee: string;
  due: string;
  date: string;
  completed: boolean;
};
const dateTime = (date: string) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(date));

function Evidence({ item }: { item: ReportDetail['evidence'][number] }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="admin-detail-evidence">
      <div className="admin-detail-preview">
        {item.type === 'photo' && !failed ? (
          <NextImage
            src={item.url}
            alt={item.caption}
            fill
            unoptimized
            sizes="(max-width:767px) 100vw, 300px"
            onError={() => setFailed(true)}
          />
        ) : (
          <>
            <ImageIcon size={24} aria-hidden="true" />
            <span>
              {item.type === 'photo'
                ? 'Photo preview unavailable'
                : 'Document attached'}
            </span>
          </>
        )}
      </div>
      <figcaption>{item.caption}</figcaption>
      {!failed && (
        <a href={item.url} target="_blank" rel="noreferrer">
          View evidence
        </a>
      )}
    </figure>
  );
}

function MessageForm({
  internal,
  onSave,
}: {
  internal?: boolean;
  onSave: (message: string) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ message: string }>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  return (
    <form
      onSubmit={handleSubmit(({ message }) => {
        onSave(message.trim());
        reset();
      })}
    >
      <Textarea
        label={internal ? 'Internal note' : 'Update for the worker'}
        rows={3}
        {...register('message', {
          validate: (value) =>
            !!value.trim() || 'Enter a message before saving.',
        })}
        error={errors.message?.message}
      />
      <Button type="submit" variant={internal ? 'secondary' : 'primary'}>
        {internal ? 'Add note' : 'Send update'}
      </Button>
    </form>
  );
}

export function ReportManagement({
  initialReport,
}: {
  initialReport: ReportDetail;
}) {
  const [report, setReport] = useState(initialReport);
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [resolution, setResolution] = useState('');
  const [feedback, setFeedback] = useState('');
  const assessment = useForm<Assessment>({
    defaultValues: {
      classification: report.classification,
      severity: report.hseSeverity,
      assignee: report.assignedTo,
      status: report.hseStatus,
    },
  });
  const actionForm = useForm<{ title: string; assignee: string; due: string }>({
    defaultValues: { assignee: report.assignedTo },
    reValidateMode: 'onChange',
  });
  const resolutionForm = useForm<{
    summary: string;
    update: string;
    confirmed: boolean;
  }>({ reValidateMode: 'onChange' });
  const actor = 'HSE Admin';
  const log = (
    current: ReportDetail,
    event: string,
    details: string,
  ): ReportDetail => ({
    ...current,
    activity: [
      ...current.activity,
      { date: new Date().toISOString(), event, details, user: actor },
    ],
  });
  const send = (message: string, internal: boolean) => {
    const date = new Date().toISOString();
    setReport((current) =>
      log(
        internal
          ? {
              ...current,
              internalNotes: [
                ...current.internalNotes,
                { date, note: message, author: actor },
              ],
            }
          : {
              ...current,
              workerUpdates: [
                ...current.workerUpdates,
                { date, message, sentBy: actor },
              ],
            },
        internal ? 'Internal note added' : 'Worker update published',
        internal ? 'Visible to HSE only.' : message,
      ),
    );
    setFeedback(internal ? 'Internal note added.' : 'Worker update sent.');
  };
  return (
    <div className="admin-report-detail">
      <Link href="/hse-admin/reports" className="admin-detail-back">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to reports
      </Link>
      <header className="admin-detail-heading">
        <h1>{report.title}</h1>
        <div className="admin-detail-metadata">
          <ReportTypeLabel type={report.classification} />
          <ReportSeverityLabel severity={report.hseSeverity} />
          <ReportStatusLabel status={report.hseStatus} />
        </div>
        <p className="admin-detail-meta">
          Reported {dateTime(report.submittedAt)} UTC · {report.location.site} ·{' '}
          {report.location.area} · {report.id}
        </p>
      </header>
      <p role="status" className="admin-detail-feedback">
        {feedback}
      </p>
      <div className="admin-detail-grid">
        <div className="admin-detail-main">
          <section>
            <h2>
              <FileText size={18} aria-hidden="true" />
              Report details
            </h2>
            <dl className="admin-detail-facts">
              <div>
                <dt>Worker report type</dt>
                <dd>
                  {
                    typeOptions.find((option) => option.value === report.type)
                      ?.label
                  }
                </dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>{report.description}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  {report.location.site} — {report.location.area}
                </dd>
              </div>
              <div>
                <dt>Reported by</dt>
                <dd>{report.submittedBy}</dd>
              </div>
              <div>
                <dt>Date & time</dt>
                <dd>{dateTime(report.submittedAt)} UTC</dd>
              </div>
            </dl>
            <h3>Evidence</h3>
            <div className="admin-detail-evidence-grid">
              {report.evidence.map((item, index) => (
                <Evidence key={index} item={item} />
              ))}
            </div>
            {!report.evidence.length && <p>No evidence attached.</p>}
            <h3>Worker answers</h3>
            <dl className="admin-detail-answers">
              {report.workerAnswers.map((answer, index) => (
                <div key={index}>
                  <dt>{answer.question}</dt>
                  <dd>{answer.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
          <div className="admin-detail-communication">
            <section className="admin-detail-message-card safira-card-surface">
              <h2>
                <ChatCircle size={18} aria-hidden="true" />
                Worker-facing updates
              </h2>
              <p className="admin-detail-help">
                Visible to the worker who submitted this report.
              </p>
              {report.workerUpdates.map((update, index) => (
                <div className="admin-detail-entry" key={index}>
                  <p>{update.message}</p>
                  <small>
                    {update.sentBy} · {dateTime(update.date)} UTC
                  </small>
                </div>
              ))}
              <MessageForm onSave={(message) => send(message, false)} />
            </section>
            <section className="admin-detail-message-card safira-card-surface">
              <h2>
                <Lock size={18} aria-hidden="true" />
                Internal notes
              </h2>
              <p className="admin-detail-help">
                Only visible to HSE officers and admins.
              </p>
              {report.internalNotes.map((note, index) => (
                <div className="admin-detail-entry" key={index}>
                  <p>{note.note}</p>
                  <small>
                    {note.author} · {dateTime(note.date)} UTC
                  </small>
                </div>
              ))}
              <MessageForm internal onSave={(message) => send(message, true)} />
            </section>
          </div>
          <section className="admin-detail-actions safira-card-surface">
            <h2>Actions</h2>
            {actions.map((action, index) => (
              <div className="admin-detail-entry" key={index}>
                <strong>{action.title}</strong>
                <p>
                  {action.assignee} ·{' '}
                  {action.due ? `Due ${action.due}` : 'No due date'} ·{' '}
                  {action.completed ? 'Completed' : 'Open'}
                </p>
                {!action.completed && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setActions((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, completed: true }
                            : item,
                        ),
                      );
                      setReport((current) =>
                        log(current, 'Action completed', action.title),
                      );
                      setFeedback('Action marked complete.');
                    }}
                  >
                    Mark complete
                  </Button>
                )}
              </div>
            ))}
            <form
              onSubmit={actionForm.handleSubmit((values) => {
                const date = new Date().toISOString();
                setActions((current) => [
                  ...current,
                  {
                    ...values,
                    title: values.title.trim(),
                    date,
                    completed: false,
                  },
                ]);
                setReport((current) =>
                  log(current, 'Action recorded', values.title.trim()),
                );
                actionForm.reset({
                  title: '',
                  assignee: report.assignedTo,
                  due: '',
                });
                setFeedback('Action recorded.');
              })}
            >
              <Input
                label="Action title"
                {...actionForm.register('title', {
                  validate: (value) =>
                    !!value.trim() || 'Enter an action title.',
                })}
                error={actionForm.formState.errors.title?.message}
              />
              <div className="admin-detail-form-row">
                <Select
                  label="Action assignee"
                  {...actionForm.register('assignee')}
                >
                  <option value={report.assignedTo}>{report.assignedTo}</option>
                  {assigneeOptions
                    .filter((option) => option.label !== report.assignedTo)
                    .map((option) => (
                      <option key={option.value} value={option.label}>
                        {option.label}
                      </option>
                    ))}
                </Select>
                <Input
                  label="Due date"
                  type="date"
                  {...actionForm.register('due')}
                />
              </div>
              <Button type="submit">Record action</Button>
            </form>
          </section>
          <section>
            <h2>Resolution</h2>
            {resolution && <p className="admin-detail-entry">{resolution}</p>}
            <form
              onSubmit={resolutionForm.handleSubmit((values) => {
                setResolution(values.summary.trim());
                setReport((current) => {
                  const resolved = {
                    ...current,
                    status: 'resolved' as Status,
                    hseStatus: 'resolved' as Status,
                  };
                  const withUpdate = values.update.trim()
                    ? {
                        ...resolved,
                        workerUpdates: [
                          ...resolved.workerUpdates,
                          {
                            date: new Date().toISOString(),
                            message: values.update.trim(),
                            sentBy: actor,
                          },
                        ],
                      }
                    : resolved;
                  return log(
                    withUpdate,
                    'Report resolved',
                    values.summary.trim(),
                  );
                });
                assessment.setValue('status', 'resolved');
                resolutionForm.reset();
                setFeedback('Report resolved.');
              })}
            >
              <Textarea
                label="Resolution summary"
                rows={3}
                {...resolutionForm.register('summary', {
                  validate: (value) =>
                    !!value.trim() || 'Describe how this report was resolved.',
                })}
                error={resolutionForm.formState.errors.summary?.message}
              />
              <Textarea
                label="Worker-facing resolution update (optional)"
                rows={2}
                {...resolutionForm.register('update')}
              />
              <label className="admin-detail-confirm">
                <input
                  type="checkbox"
                  {...resolutionForm.register('confirmed', {
                    required: 'Confirm the issue has been addressed.',
                  })}
                />
                I confirm the issue has been addressed.
              </label>
              {resolutionForm.formState.errors.confirmed && (
                <p className="text-critical text-sm" role="alert">
                  {resolutionForm.formState.errors.confirmed.message}
                </p>
              )}
              <Button
                type="submit"
                disabled={
                  report.hseStatus === 'resolved' ||
                  report.hseStatus === 'closed'
                }
              >
                Resolve report
              </Button>
            </form>
          </section>
        </div>
        <aside className="admin-detail-side">
          <section>
            <h2>
              <Shield size={18} aria-hidden="true" />
              HSE assessment
            </h2>
            <form
              onSubmit={assessment.handleSubmit((values) => {
                const classification = hseClassificationSchema.parse(
                  values.classification,
                );
                const severity = reportSeveritySchema.parse(values.severity);
                const status = reportStatusSchema.parse(values.status);
                setReport((current) =>
                  log(
                    {
                      ...current,
                      classification,
                      hseSeverity: severity,
                      severity,
                      hseStatus: status,
                      status,
                      assignedTo: values.assignee,
                    },
                    'Assessment saved',
                    `${classification.replaceAll('_', ' ')} · ${severity} · ${status.replaceAll('_', ' ')} · Assigned to ${values.assignee}`,
                  ),
                );
                setFeedback('Assessment saved.');
              })}
            >
              <Select
                label="Classification"
                {...assessment.register('classification')}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select label="Severity" {...assessment.register('severity')}>
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select label="Assigned to" {...assessment.register('assignee')}>
                <option value={initialReport.assignedTo}>
                  {initialReport.assignedTo}
                </option>
                {assigneeOptions
                  .filter((option) => option.label !== initialReport.assignedTo)
                  .map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
              </Select>
              <Select label="Status" {...assessment.register('status')}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button type="submit">Save assessment</Button>
            </form>
          </section>
          <section>
            <h2>
              <Clock size={18} aria-hidden="true" />
              Activity history
            </h2>
            <ol className="admin-detail-timeline">
              {[...report.activity].reverse().map((item, index) => (
                <li key={index}>
                  <time dateTime={item.date}>{dateTime(item.date)} UTC</time>
                  <strong>{item.event}</strong>
                  {item.details && <p>{item.details}</p>}
                  <small>{item.user}</small>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
