'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Image, FileText, Warning, Clock, User, MapPin, Shield, ChatCircle, Lock, Plus, PaperPlane, Download, Pencil, Calendar } from '@phosphor-icons/react';
import { TypePill, SeverityPill, StatusPill } from '@/components/ui/feedback';
import { Select, Textarea, Input } from '@/components/ui/forms';
import { Button } from '@/components/ui/button';
import { reportData, ReportDetail, ReportType, Severity, Status, statusOptions, severityOptions, typeOptions, assigneeOptions } from '@/data/reports';

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

function SectionHeader({ title, icon, action, urgent = false }: { title: string; icon?: React.ReactNode; action?: React.ReactNode; urgent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-graphite/60">{icon}</span>}
        <h2 className={`text-[14px] font-semibold leading-5 text-deepCharcoal uppercase tracking-wide ${urgent ? 'text-critical' : ''}`}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function EvidenceGrid({ evidence }: { evidence: ReportDetail['evidence'] }) {
  if (!evidence.length) return <p className="text-sm text-graphite/60">No evidence attached.</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {evidence.map((item, idx) => (
        <div key={idx} className="grid gap-2 rounded-lg border border-graphite/10 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-coolSurface text-graphite/60">
              {item.type === 'photo' ? <Image size={18} alt="" /> : <FileText size={18} />}
            </span>
            <span className="text-xs font-medium text-graphite/70 uppercase tracking-wide">{item.type}</span>
          </div>
          <p className="text-sm text-deepCharcoal line-clamp-2">{item.caption}</p>
          <button className="inline-flex items-center gap-1 text-xs font-medium text-signalYellow hover:text-graphite transition-colors mt-1">
            <ArrowRight size={12} aria-hidden="true" />
            View
          </button>
        </div>
      ))}
    </div>
  );
}

function KeyValueRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      {icon && <span className="flex-shrink-0 w-5 text-graphite/50">{icon}</span>}
      <div className="grid gap-0.5 min-w-0">
        <span className="text-xs font-medium text-graphite/70 uppercase tracking-wide">{label}</span>
        <span className="text-sm text-deepCharcoal">{value}</span>
      </div>
    </div>
  );
}

function ActivityItem({ item }: { item: ReportDetail['activity'][0] }) {
  return (
    <div className="flex gap-3 py-2 border-t border-graphite/10">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-coolSurface flex items-center justify-center">
        <Clock size={14} className="text-graphite/60" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-deepCharcoal">{item.event}</span>
          <span className="text-xs text-graphite/60">{new Date(item.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {item.details && <p className="text-sm text-graphite/70 mt-0.5">{item.details}</p>}
        <p className="text-xs text-graphite/50">By {item.user}</p>
      </div>
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
  if (!isOpen) return null;

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
    <>
      <div
        className="fixed inset-0 z-40 bg-deepCharcoal/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg md:w-2/3 lg:max-w-2xl bg-white shadow-xl flex flex-col md:hidden">
        <div className="flex h-14 items-center justify-between border-b border-graphite/20 px-4">
          <h2 className="text-sm font-semibold text-deepCharcoal">Record Action</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-graphite/70 hover:text-graphite hover:bg-coolSurface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
            aria-label="Close"
          >
            <Pencil size={20} aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="action-title" className="text-sm font-semibold text-deepCharcoal">Action Title *</label>
              <input
                id="action-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter action title..."
                className="mt-1 h-9 w-full rounded-md border border-graphite/20 bg-white px-3 text-sm text-deepCharcoal placeholder:text-graphite/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
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
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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

          <div>
            <label className="text-sm font-semibold text-deepCharcoal">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the action to be taken..."
              rows={3}
              className="mt-1 h-24 w-full rounded-md border border-graphite/20 bg-white px-3 text-sm text-deepCharcoal placeholder:text-graphite/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="worker-facing"
              checked={workerFacing}
              onChange={(e) => setWorkerFacing(e.target.checked)}
              className="size-4 accent-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
            />
            <label htmlFor="worker-facing" className="text-sm font-medium text-deepCharcoal">
              Mark as worker-facing (visible to reporter)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-graphite/10">
            <Button type="button" variant="secondary" className="h-9" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="h-9" disabled={!title.trim()}>
              <Plus size={14} aria-hidden="true" />
              Record Action
            </Button>
          </div>
        </form>
      </aside>
    </>
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
  onSave: (resolution: Omit<Resolution, 'id' | 'resolvedAt' | 'resolvedBy'>) => void;
}) {
  if (!isOpen) return null;

  const [summary, setSummary] = useState('');
  const [evidence, setEvidence] = useState<{ type: 'photo' | 'document'; url: string; caption: string }[]>([]);
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
    <>
      <div
        className="fixed inset-0 z-40 bg-deepCharcoal/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg md:w-2/3 lg:max-w-2xl bg-white shadow-xl flex flex-col md:hidden">
        <div className="flex h-14 items-center justify-between border-b border-graphite/20 px-4">
          <h2 className="text-sm font-semibold text-deepCharcoal">Resolve Report</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-graphite/70 hover:text-graphite hover:bg-coolSurface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
            aria-label="Close"
          >
            <Pencil size={20} aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label htmlFor="resolution-summary" className="text-sm font-semibold text-deepCharcoal">Resolution Summary *</label>
            <textarea
              id="resolution-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe how the issue was resolved..."
              rows={3}
              className="mt-1 h-24 w-full rounded-md border border-graphite/20 bg-white px-3 text-sm text-deepCharcoal placeholder:text-graphite/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information resize-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-deepCharcoal">Resolution Evidence (optional)</label>
            <div className="mt-1 h-24 w-full rounded-md border border-graphite/20 bg-white p-3 text-sm text-graphite/60 flex items-center justify-center">
              <span>Evidence upload placeholder</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-deepCharcoal">Worker-Facing Update (optional)</label>
            <textarea
              value={workerUpdate}
              onChange={(e) => setWorkerUpdate(e.target.value)}
              placeholder="Write an update visible to the reporter..."
              rows={2}
              className="mt-1 h-16 w-full rounded-md border border-graphite/20 bg-white px-3 text-sm text-deepCharcoal placeholder:text-graphite/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="resolution-confirmed"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="size-4 accent-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-information"
            />
            <label htmlFor="resolution-confirmed" className="text-sm font-medium text-deepCharcoal">
              I confirm this report is resolved and the summary accurately reflects the outcome
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-graphite/10">
            <Button type="button" variant="secondary" className="h-9" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="h-9" disabled={!summary.trim() || !confirmed}>
              <Plus size={14} aria-hidden="true" />
              Resolve Report
            </Button>
          </div>
        </form>
      </aside>
    </>
  );
}

function AssessmentForm({ report }: { report: ReportDetail }) {
  const [classification, setClassification] = useState(report.classification);
  const [severity, setSeverity] = useState(report.hseSeverity);
  const [assignedTo, setAssignedTo] = useState(report.assignedTo);
  const [hseStatus, setHseStatus] = useState(report.hseStatus);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="HSE Assessment"
        icon={<Shield size={16} />}
        action={
          <Button variant="primary" className="h-9">
            <Download size={14} aria-hidden="true" />
            Save Assessment
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Classification"
          value={classification}
          onChange={(e) => setClassification(e.target.value as ReportType)}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>

        <Select
          label="Severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity)}
        >
          {severityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>

        <Select
          label="Status"
          value={hseStatus}
          onChange={(e) => setHseStatus(e.target.value as Status)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>

        <Select
          label="Assigned To"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          {assigneeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      <div className="pt-3 border-t border-graphite/10">
        <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-2">Worker vs HSE</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <span className="text-xs font-medium text-graphite/70">Classification</span>
            <div className="flex items-center gap-2 flex-wrap mt-1 text-sm">
              <span className="text-graphite/60">Worker:</span>
              <TypePill label={report.type} />
              <span className="text-graphite/50">→</span>
              <TypePill label={classification} />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-graphite/70">Severity</span>
            <div className="flex items-center gap-2 flex-wrap mt-1 text-sm">
              <span className="text-graphite/60">Worker:</span>
              <SeverityPill label={report.severity} />
              <span className="text-graphite/50">→</span>
              <SeverityPill label={severity} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-graphite/10">
        <Button variant="primary" className="w-full sm:w-auto h-9">
          <Download size={14} aria-hidden="true" />
          Save Assessment
        </Button>
      </div>
    </div>
  );
}

function WorkerUpdateForm({ updates, onSend }: { updates: ReportDetail['workerUpdates']; onSend: (message: string) => void }) {
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Worker-Facing Update"
        icon={<ChatCircle size={16} />}
        action={
          <Button variant="primary" className="h-9" onClick={() => { onSend(message); setMessage(''); }} disabled={!message.trim()}>
            <PaperPlane size={14} aria-hidden="true" />
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
          <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-2">Previous Updates</h3>
          <div className="space-y-2">
            {updates.map((update, idx) => (
              <div key={idx} className="rounded-lg border border-graphite/10 bg-coolSurface p-3">
                <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
                  <span className="font-medium text-deepCharcoal">{update.sentBy}</span>
                  <span className="text-graphite/60">{new Date(update.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-graphite">{update.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InternalNotesForm({ notes, onAdd }: { notes: ReportDetail['internalNotes']; onAdd: (note: string) => void }) {
  const [note, setNote] = useState('');

  return (
    <div className="space-y-4 border-l-4 border-graphite/30 bg-white/50 rounded-lg p-4">
      <SectionHeader
        title="Internal HSE Notes"
        icon={<Lock size={16} />}
        action={
          <Button variant="secondary" className="h-9" onClick={() => { onAdd(note); setNote(''); }} disabled={!note.trim()}>
            <Plus size={14} aria-hidden="true" />
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
          <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-2">Previous Notes</h3>
          <div className="space-y-2">
            {notes.map((n, idx) => (
              <div key={idx} className="rounded-lg border border-graphite/10 bg-white p-3">
                <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
                  <span className="font-medium text-deepCharcoal">{n.author}</span>
                  <span className="text-graphite/60">{new Date(n.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-graphite">{n.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
      <div className="mx-auto w-full max-w-[1120px] px-4 py-3 lg:px-6 lg:py-4">
        <div className="grid gap-6 text-center py-12">
          <Warning size={48} className="mx-auto text-critical" aria-hidden="true" />
          <h1 className="text-[22px] font-semibold text-deepCharcoal">Report not found</h1>
          <p className="text-sm text-graphite">The report <code className="font-mono">{id}</code> does not exist.</p>
          <Link href="/hse-officer/reports" className="inline-flex items-center justify-center gap-1 text-sm font-medium text-signalYellow hover:text-graphite mx-auto mt-4">
            <ArrowLeft size={14} aria-hidden="true" />
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleRecordActionSave = (actionData: Omit<Action, 'id' | 'createdAt' | 'createdBy'>) => {
    const newAction: Action = {
      ...actionData,
      id: `ACT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'Current HSE Officer',
    };
    setActions(prev => [...prev, newAction]);
  };

  const handleResolveReportSave = (resolutionData: Omit<Resolution, 'id' | 'resolvedAt' | 'resolvedBy'>) => {
    const newResolution: Resolution = {
      ...resolutionData,
      id: `RES-${Date.now()}`,
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'Current HSE Officer',
    };
    // In a real app, this would persist the resolution to the data store.
    // Prototype: resolution exists only in local component state (session only).
    // The Reports list uses shared static data and will NOT reflect Resolved after reload.
    setActions(prev => [...prev, {
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
    }]);
  };

  const allActivity = [
    ...report.activity,
    ...actions.map(a => {
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
    <div className="mx-auto w-full max-w-[1120px] px-4 py-3 lg:px-6 lg:py-4">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <Link
          href="/hse-officer/reports"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-signalYellow hover:text-graphite transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Reports
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <TypePill label={report.type} />
          <SeverityPill label={report.severity} />
          <StatusPill label={report.status} />
        </div>
      </header>

      {/* Report Title & Meta */}
      <section className="mb-5">
        <h1 className="text-[24px] font-semibold leading-7 text-deepCharcoal">{report.title}</h1>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-graphite/70">
          <span className="flex items-center gap-1"><MapPin size={14} aria-hidden="true" /> {report.site}</span>
          <span className="flex items-center gap-1"><Clock size={14} aria-hidden="true" /> Submitted {formatDateTime(report.submittedAt)}</span>
          <span className="flex items-center gap-1"><User size={14} aria-hidden="true" /> {report.submittedBy}</span>
          <span className="flex items-center gap-1 text-xs font-mono text-graphite/50">{report.id}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-graphite/10">
          <TypePill label={report.type} />
          <SeverityPill label={report.severity} />
          <StatusPill label={report.status} />
        </div>
      </section>

      {/* Two-column layout */}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Main Column */}
        <main className="space-y-4">
          {/* Worker Report */}
          <section className="space-y-4">
            <SectionHeader title="Worker Report" icon={<FileText size={16} />} />
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-sm text-graphite whitespace-pre-line leading-relaxed">{report.description}</p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-2">Evidence</h3>
                <EvidenceGrid evidence={report.evidence} />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-graphite/70 uppercase tracking-wide mb-2">Worker Answers</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {report.workerAnswers.map((qa, idx) => (
                    <div key={idx} className="rounded-lg border border-graphite/10 bg-white p-3">
                      <p className="text-xs font-medium text-graphite/70">{qa.question}</p>
                      <p className="text-sm text-graphite">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-1.5 sm:grid-cols-2 border-t border-graphite/10 pt-3">
                <KeyValueRow label="Location" value={report.location.area} icon={<MapPin size={14} />} />
                <KeyValueRow label="Site" value={report.location.site} />
                {report.location.coordinates && (
                  <KeyValueRow label="Coordinates" value={report.location.coordinates} />
                )}
                <KeyValueRow label="Submitted by" value={report.submittedBy} icon={<User size={14} />} />
                <KeyValueRow label="Submitted" value={formatDateTime(report.submittedAt)} icon={<Clock size={14} />} />
              </div>
            </div>
          </section>

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
          <section className="space-y-0">
            <SectionHeader title="Activity Timeline" icon={<Clock size={16} />} />
            <div className="space-y-0">
              {allActivity.map((item, idx) => (
                <ActivityItem key={idx} item={item} />
              ))}
            </div>
          </section>
        </main>

        {/* Secondary Column - HSE Assessment + Context */}
        <aside className="hidden lg:block space-y-4">
          <section className="space-y-4">
            <AssessmentForm report={report} />
          </section>

          <section className="space-y-2">
            <h3 className="text-[13px] font-semibold text-deepCharcoal uppercase tracking-wide">Report Reference</h3>
            <div className="space-y-1.5 rounded-lg border border-graphite/10 bg-white p-3">
              <KeyValueRow label="Report ID" value={report.id} />
              <KeyValueRow label="Type" value={report.type.replace('_', ' ')} />
              <KeyValueRow label="Severity" value={report.severity} />
              <KeyValueRow label="Status" value={report.status.replace('_', ' ')} />
              <KeyValueRow label="Assigned to" value={report.assignedTo} />
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-[13px] font-semibold text-deepCharcoal uppercase tracking-wide">Actions</h3>
            <div className="space-y-2">
              <Button variant="primary" className="w-full justify-start h-9" onClick={() => setRecordActionOpen(true)}>
                <Plus size={14} aria-hidden="true" />
                Record Action
              </Button>
              <Button variant="secondary" className="w-full justify-start h-9" onClick={() => setResolveReportOpen(true)}>
                <Plus size={14} aria-hidden="true" />
                Resolve Report
              </Button>
              <Button variant="secondary" className="w-full justify-start h-9">
                <PaperPlane size={14} aria-hidden="true" />
                Send Worker Update
              </Button>
              <Button variant="tertiary" className="w-full justify-start h-9">
                <Plus size={14} aria-hidden="true" />
                Add Internal Note
              </Button>
            </div>
          </section>

          <section className="space-y-2 pt-2 border-t border-graphite/10">
            <h3 className="text-[13px] font-semibold text-critical uppercase tracking-wide">Emergency</h3>
            <div className="p-3 rounded-md bg-graphite/5 border border-graphite/10">
              <p className="text-xs font-medium text-graphite/70 flex items-center gap-1 mb-1">
                <Warning size={12} aria-hidden="true" />
                Not an emergency response tool
              </p>
              <p className="text-xs text-graphite/60">
                For immediate danger, follow site emergency procedures first.
              </p>
            </div>
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
          setActions(prev => [...prev, newAction]);
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
          setActions(prev => [...prev, {
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
          }]);
        }}
      />
    </div>
  );
}