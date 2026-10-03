'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Warning,
  Clock,
  User,
  MapPin,
  Shield,
  ChatCircle,
  Lock,
  Plus,
  PaperPlane,
  FloppyDisk,
} from '@phosphor-icons/react';
import {
  OfficerPanel,
  ReportMetadata,
  SectionHeader,
  Select,
  Textarea,
  Input,
  Button,
} from '@/components/hse-officer/ui';
import { InfoCard } from '@/components/ui/feedback';
import { Checkbox } from '@/components/ui/forms';
import { SidePanel } from '@/components/ui/side-panel';
import { EvidenceCard } from '@/components/ui/evidence-card';
import { ReportDetailsGrid } from '@/components/ui/report-details-grid';
import { Timeline } from '@/components/ui/timeline';
import {
  reportData,
  ReportDetail,
  ReportType,
  Severity,
  Status,
  statusOptions,
  severityOptions,
  typeOptions,
  assigneeOptions,
} from '@/data/reports';

type ActionPriority = 'low' | 'medium' | 'high' | 'critical';
type ActionStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

interface Action {
  id: string;
  reportId: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: ActionPriority;
  status: ActionStatus;
  createdAt: string;
  createdBy: string;
  workerFacing: boolean;
  evidence?: { type: 'photo' | 'document'; url: string; caption: string }[];
  // Resolution-specific (for timeline distinction)
  isResolution?: boolean;
  resolutionSummary?: string;
  workerUpdate?: string;
}

type ResolutionStatus = 'resolved';

interface Resolution {
  id: string;
  reportId: string;
  summary: string;
  evidence?: { type: 'photo' | 'document'; url: string; caption: string }[];
  resolvedBy: string;
  resolvedAt: string;
  workerUpdate?: string;
  confirmed: boolean;
}

function EvidenceGrid({ evidence }: { evidence: ReportDetail['evidence'] }) {
  if (!evidence.length)
    return <p className="text-sm text-graphite/60">No evidence attached.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {evidence.map((item, index) => (
        <EvidenceCard key={index} item={item} />
      ))}
    </div>
  );
}

function RecordActionModal({
  isOpen,
  onClose,
  report,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  report: ReportDetail;
  onSave: (action: Omit<Action, 'id' | 'createdAt' | 'createdBy'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(assigneeOptions[0].value);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('medium');
  const [status, setStatus] = useState<ActionStatus>('open');
  const [workerFacing, setWorkerFacing] = useState(false);

  const priorityOptions: { value: ActionPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      reportId: report.id,
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      dueDate,
      priority,
      status,
      workerFacing,
    });
    onClose();
  };

  return (
    <SidePanel
      open={isOpen}
      title="Record Action"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={!title.trim()}
          >
            Record Action
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            id="action-title"
            label="Action Title *"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter action title..."
            required
          />
        </div>
        <Select
          label="Assigned To"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full"
        >
          {assigneeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full"
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as ActionPriority)}
        >
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ActionStatus)}
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the action to be taken..."
        rows={3}
      />

      <Checkbox
        id="worker-facing"
        label="Mark as worker-facing (visible to reporter)"
        checked={workerFacing}
        onChange={(e) => setWorkerFacing(e.target.checked)}
      />
    </SidePanel>
  );
}

function ResolveReportModal({
  isOpen,
  onClose,
  report,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  report: ReportDetail;
  onSave: (
    resolution: Omit<Resolution, 'id' | 'resolvedAt' | 'resolvedBy'>,
  ) => void;
}) {
  const [summary, setSummary] = useState('');
  const [evidence, setEvidence] = useState<
    { type: 'photo' | 'document'; url: string; caption: string }[]
  >([]);
  const [workerUpdate, setWorkerUpdate] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;
    if (!confirmed) return;
    onSave({
      reportId: report.id,
      summary: summary.trim(),
      evidence: evidence,
      workerUpdate: workerUpdate.trim() || undefined,
      confirmed,
    });
    onClose();
  };

  return (
    <SidePanel
      open={isOpen}
      title="Resolve Report"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Shield size={16} aria-hidden="true" />}
            disabled={!summary.trim() || !confirmed}
          >
            Resolve Report
          </Button>
        </>
      }
    >
      <Textarea
        id="resolution-summary"
        label="Resolution Summary *"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Describe how the issue was resolved..."
        rows={3}
        required
      />

      <div>
        <label className="text-sm font-semibold text-deepCharcoal">
          Resolution Evidence (optional)
        </label>
        <div className="mt-1 h-24 w-full rounded-md border border-graphite/20 bg-white p-3 text-sm text-graphite/60 flex items-center justify-center">
          <span>Evidence upload placeholder</span>
        </div>
      </div>

      <Textarea
        label="Worker-Facing Update (optional)"
        value={workerUpdate}
        onChange={(e) => setWorkerUpdate(e.target.value)}
        placeholder="Write an update visible to the reporter..."
        rows={2}
      />

      <Checkbox
        id="resolution-confirmed"
        label="I confirm this report is resolved and the summary accurately reflects the outcome"
        checked={confirmed}
        onChange={(e) => setConfirmed(e.target.checked)}
      />
    </SidePanel>
  );
}

function AssessmentForm({ report }: { report: ReportDetail }) {
  const [classification, setClassification] = useState(report.classification);
  const [severity, setSeverity] = useState(report.hseSeverity);
  const [assignedTo, setAssignedTo] = useState(report.assignedTo);
  const [hseStatus, setHseStatus] = useState(report.hseStatus);

  return (
    <OfficerPanel className="space-y-4 border-t-4 border-t-signalYellow">
      <SectionHeader title="HSE Assessment" icon={<Shield size={16} />} />

      <div className="grid gap-3">
        <Select
          label="Classification"
          value={classification}
          onChange={(e) => setClassification(e.target.value as ReportType)}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Select
          label="Severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity)}
        >
          {severityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Select
          label="Status"
          value={hseStatus}
          onChange={(e) => setHseStatus(e.target.value as Status)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Select
          label="Assigned To"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          {assigneeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="pt-3 border-t border-graphite/10">
        <Button
          variant="primary"
          className="w-full sm:w-auto"
          icon={<FloppyDisk size={16} aria-hidden="true" />}
        >
          Save Assessment
        </Button>
      </div>
    </OfficerPanel>
  );
}

function WorkerUpdateForm({
  updates,
  onSend,
}: {
  updates: ReportDetail['workerUpdates'];
  onSend: (message: string) => void;
}) {
  const [message, setMessage] = useState('');

  return (
    <OfficerPanel className="space-y-4 border-l-4 border-l-information">
      <SectionHeader
        title="Worker-Facing Update"
        icon={<ChatCircle size={16} />}
        action={
          <Button
            variant="primary"
            icon={<PaperPlane size={16} aria-hidden="true" />}
            onClick={() => {
              onSend(message);
              setMessage('');
            }}
            disabled={!message.trim()}
          >
            Send Update
          </Button>
        }
      />

      <Textarea
        label="Message to worker"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write an update visible to the reporter..."
        rows={3}
      />

      {updates.length > 0 && (
        <div className="border-t border-graphite/10 pt-3">
          <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-2">
            Previous Updates
          </h3>
          <div className="space-y-2">
            {updates.map((update, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-graphite/10 bg-coolSurface p-3"
              >
                <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
                  <span className="font-medium text-deepCharcoal">
                    {update.sentBy}
                  </span>
                  <span className="text-graphite/60">
                    {new Date(update.date).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-graphite">{update.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </OfficerPanel>
  );
}

function InternalNotesForm({
  notes,
  onAdd,
}: {
  notes: ReportDetail['internalNotes'];
  onAdd: (note: string) => void;
}) {
  const [note, setNote] = useState('');

  return (
    <OfficerPanel className="space-y-4 border-l-4 border-l-graphite/50">
      <SectionHeader
        title="Internal HSE Notes"
        icon={<Lock size={16} />}
        action={
          <Button
            variant="secondary"
            icon={<Plus size={16} aria-hidden="true" />}
            onClick={() => {
              onAdd(note);
              setNote('');
            }}
            disabled={!note.trim()}
          >
            Add Note
          </Button>
        }
      />

      <div className="mb-3 p-2.5 rounded-md bg-white border border-graphite/20">
        <p className="text-xs font-medium text-graphite/70 flex items-center gap-1">
          <Lock size={12} aria-hidden="true" />
          HSE Only — Not visible to workers
        </p>
      </div>

      <Textarea
        label="Internal note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add internal assessment note..."
        rows={2}
      />

      {notes.length > 0 && (
        <div className="border-t border-graphite/10 pt-3">
          <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-2">
            Previous Notes
          </h3>
          <div className="space-y-2">
            {notes.map((n, idx) => (
              <div key={idx} className="border-b border-graphite/10 py-2">
                <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
                  <span className="font-medium text-deepCharcoal">
                    {n.author}
                  </span>
                  <span className="text-graphite/60">
                    {new Date(n.date).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-graphite">{n.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </OfficerPanel>
  );
}

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const report = reportData[id];
  const [recordActionOpen, setRecordActionOpen] = useState(false);
  const [resolveReportOpen, setResolveReportOpen] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);

  if (!report) {
    return (
      <div className="w-full min-w-0">
        <div className="grid gap-6 text-center py-12">
          <Warning
            size={48}
            className="mx-auto text-critical"
            aria-hidden="true"
          />
          <h1 className="text-[22px] font-semibold text-deepCharcoal">
            Report not found
          </h1>
          <p className="text-sm text-graphite">
            The report <code className="font-mono">{id}</code> does not exist.
          </p>
          <Link
            href="/hse-officer/reports"
            className="inline-flex items-center justify-center gap-1 text-sm font-medium text-signalYellow hover:text-graphite mx-auto mt-4"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRecordActionSave = (
    actionData: Omit<Action, 'id' | 'createdAt' | 'createdBy'>,
  ) => {
    const newAction: Action = {
      ...actionData,
      id: `ACT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'Current HSE Officer',
    };
    setActions((prev) => [...prev, newAction]);
  };

  const handleResolveReportSave = (
    resolutionData: Omit<Resolution, 'id' | 'resolvedAt' | 'resolvedBy'>,
  ) => {
    const newResolution: Resolution = {
      ...resolutionData,
      id: `RES-${Date.now()}`,
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'Current HSE Officer',
    };
    // In a real app, this would persist the resolution to the data store.
    // Prototype: resolution exists only in local component state (session only).
    // The Reports list uses shared static data and will NOT reflect Resolved after reload.
    setActions((prev) => [
      ...prev,
      {
        id: `RES-${Date.now()}`,
        reportId: report.id,
        title: 'Report Resolved',
        description: resolutionData.summary,
        assignedTo: 'Current HSE Officer',
        dueDate: '',
        priority: 'high' as ActionPriority,
        status: 'completed' as ActionStatus,
        createdAt: new Date().toISOString(),
        createdBy: 'Current HSE Officer',
        workerFacing: true,
        // Mark as resolution so timeline can distinguish
        isResolution: true,
        resolutionSummary: resolutionData.summary,
        workerUpdate: resolutionData.workerUpdate,
      },
    ]);
  };

  const allActivity = [
    ...report.activity,
    ...actions.map((a) => {
      if (a.isResolution) {
        return {
          date: a.createdAt,
          event: 'Report resolved',
          user: a.createdBy,
          details: `${a.resolutionSummary || a.description}${a.workerUpdate ? `\nWorker update: ${a.workerUpdate}` : ''}`,
          resolvedBy: a.createdBy,
          resolvedAt: a.createdAt,
        };
      }
      return {
        date: a.createdAt,
        event: 'Action recorded',
        user: a.createdBy,
        details: `Action "${a.title}" created (${a.priority} priority, ${a.status})`,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="w-full min-w-0">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <Link
          href="/hse-officer/reports"
          className="inline-flex items-center gap-1.5 text-sm font-medium officer-link"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Reports
        </Link>
      </header>

      {/* Report Title & Meta */}
      <section className="mb-6">
        <h1 className="text-[26px] font-semibold leading-tight text-deepCharcoal">
          {report.title}
        </h1>
        <div className="mt-3">
          <ReportMetadata
            type={report.classification}
            severity={report.hseSeverity}
            status={report.hseStatus}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-graphite/10 pt-3 text-sm text-graphite/75">
          <span className="flex items-center gap-1">
            <MapPin size={14} aria-hidden="true" /> {report.site}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} aria-hidden="true" /> Submitted{' '}
            {formatDateTime(report.submittedAt)}
          </span>
          <span className="flex items-center gap-1">
            <User size={14} aria-hidden="true" /> {report.submittedBy}
          </span>
          <span className="flex items-center gap-1 text-xs font-mono text-graphite/65">
            {report.id}
          </span>
        </div>
      </section>

      {/* Two-column layout */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(310px,360px)]">
        {/* Main Column */}
        <div className="min-w-0 space-y-5">
          {/* Worker Report */}
          <OfficerPanel>
            <SectionHeader
              title="Worker Report"
              icon={<FileText size={16} />}
            />
            <div className="divide-y divide-graphite/10">
              <div className="pb-5">
                <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-3">
                  Description
                </h3>
                <p className="text-sm text-graphite whitespace-pre-line leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="py-5">
                <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-3">
                  Evidence
                </h3>
                <EvidenceGrid evidence={report.evidence} />
              </div>

              <div className="py-5">
                <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-3">
                  Worker Answers
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {report.workerAnswers.map((qa, idx) => (
                    <div key={idx} className="border-b border-graphite/10 py-2">
                      <p className="text-xs font-medium text-graphite/70">
                        {qa.question}
                      </p>
                      <p className="text-sm text-graphite">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5">
                <ReportDetailsGrid
                  items={[
                    { label: 'Location', value: report.location.area },
                    { label: 'Site', value: report.location.site },
                    ...(report.location.coordinates
                      ? [
                          {
                            label: 'Coordinates',
                            value: report.location.coordinates,
                          },
                        ]
                      : []),
                    { label: 'Submitted by', value: report.submittedBy },
                    {
                      label: 'Submitted',
                      value: formatDateTime(report.submittedAt),
                    },
                  ]}
                />
              </div>
            </div>
          </OfficerPanel>

          {/* Worker-Facing Update */}
          <WorkerUpdateForm
            updates={report.workerUpdates}
            onSend={(message) => console.log('Send worker update:', message)}
          />

          {/* Internal Notes */}
          <InternalNotesForm
            notes={report.internalNotes}
            onAdd={(note) => console.log('Add internal note:', note)}
          />

          {/* Activity Timeline */}
          <OfficerPanel>
            <SectionHeader title="Activity Timeline" />
            <Timeline items={allActivity} />
          </OfficerPanel>
        </div>

        {/* Secondary Column - HSE Assessment + Context */}
        <aside className="min-w-0 space-y-5">
          <AssessmentForm report={report} />

          <OfficerPanel>
            <SectionHeader title="Actions" />
            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full"
                icon={<Plus size={16} aria-hidden="true" />}
                onClick={() => setRecordActionOpen(true)}
              >
                Record Action
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                icon={<Shield size={16} aria-hidden="true" />}
                onClick={() => setResolveReportOpen(true)}
              >
                Resolve Report
              </Button>
            </div>
          </OfficerPanel>

          <InfoCard
            title="Emergency — Not an emergency response tool"
            icon={<Warning size={16} />}
          >
            For immediate danger, follow site emergency procedures first.
          </InfoCard>

          <section className="border-t border-graphite/10 pt-3 text-xs text-graphite/70">
            <h3 className="font-semibold uppercase tracking-wide">
              Report Reference
            </h3>
            <p className="mt-1 font-mono">{report.id}</p>
            <p className="mt-1">Assigned to {report.assignedTo}</p>
          </section>
        </aside>
      </div>

      <RecordActionModal
        isOpen={recordActionOpen}
        onClose={() => setRecordActionOpen(false)}
        report={report}
        onSave={(actionData) => {
          const newAction: Action = {
            ...actionData,
            id: `ACT-${Date.now()}`,
            createdAt: new Date().toISOString(),
            createdBy: 'Current HSE Officer',
          };
          setActions((prev) => [...prev, newAction]);
        }}
      />
      <ResolveReportModal
        isOpen={resolveReportOpen}
        onClose={() => setResolveReportOpen(false)}
        report={report}
        onSave={(resolutionData) => {
          const newResolution = {
            ...resolutionData,
            id: `RES-${Date.now()}`,
            resolvedAt: new Date().toISOString(),
            resolvedBy: 'Current HSE Officer',
          };
          // In a real app, this would update the report in the data store
          // For demo, we update local state and activity
          setActions((prev) => [
            ...prev,
            {
              id: `ACT-${Date.now()}`,
              reportId: report.id,
              title: 'Report Resolved',
              description: resolutionData.summary,
              assignedTo: 'Current HSE Officer',
              dueDate: '',
              priority: 'high' as ActionPriority,
              status: 'completed' as ActionStatus,
              createdAt: new Date().toISOString(),
              createdBy: 'Current HSE Officer',
              workerFacing: true,
            },
          ]);
        }}
      />
    </div>
  );
}
