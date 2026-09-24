import type { HseClassification, ReportStatus } from '@safira/types';
import type { WorkerReportCategoryValue } from '@/demo/worker-data';
import { workerHomeDemo, workerReportCategories } from '@/demo/worker-data';

export type QuestionAnswer = 'yes' | 'no' | 'not_sure';
export type QuestionKey =
  'anyoneHurt' | 'anythingDamaged' | 'environmentalImpact';
export type ReportAnswers = Record<QuestionKey, QuestionAnswer | null>;

/** A status step visible on the worker-facing timeline. */
export interface DemoStatusStep {
  status: ReportStatus;
  label: string;
  timestamp: string;
}

/** A worker-facing update published by HSE. Never contains internal notes. */
export interface DemoWorkerUpdate {
  id: string;
  body: string;
  postedAt: string;
}

/** Resolution summary shown only when status is resolved or closed. */
export interface DemoResolution {
  summary: string;
  resolvedAt: string;
}

export interface ReportSourceMeta {
  type: 'checklist_submission' | 'direct';
  checklistId?: string;
  checklistTitle?: string;
  itemId?: string;
  itemPrompt?: string;
}

/**
 * A report as seen by the worker — covers both seeded demo reports
 * and newly submitted ones. Internal notes are never included here.
 */
export interface DemoReport {
  reference: string;
  /** Worker-facing category label */
  categoryLabel: string;
  /** Worker-facing category value — null for legacy seed entries */
  categoryValue: WorkerReportCategoryValue | null;
  site: string;
  workArea: string | null;
  status: ReportStatus;
  submittedAt: string;
  /** Formal HSE classification — null until set by HSE */
  classification: HseClassification | null;
  evidenceUri: string | null;
  evidenceFileName: string | null;
  description: string;
  answers: ReportAnswers | null;
  timeline: readonly DemoStatusStep[];
  updates: readonly DemoWorkerUpdate[];
  resolution: DemoResolution | null;
  source?: ReportSourceMeta;
}

export interface LocalPhotoEvidence {
  uri: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  width: number;
  height: number;
  source: 'camera' | 'library';
}

export interface ReportContent {
  category: WorkerReportCategoryValue | null;
  evidenceChoice: 'unanswered' | 'photo' | 'skipped';
  evidence: LocalPhotoEvidence | null;
  description: string;
  siteId: string;
  workAreaId: string | null;
  answers: ReportAnswers;
  source?: ReportSourceMeta;
}

export interface SavedReportDraft extends ReportContent {
  kind: 'draft';
  updatedAt: string;
}

export interface SubmittedDemoReport {
  kind: 'submitted';
  reference: string;
  status: 'submitted';
  submittedAt: string;
  content: ReportContent;
}

export interface LocalReportingState {
  draft: SavedReportDraft;
  submitted: SubmittedDemoReport | null;
  nextReferenceNumber: number;
  /** All demo reports shown in My Reports — seed + newly submitted. */
  demoReports: DemoReport[];
}

export function createDraft(): SavedReportDraft {
  return {
    kind: 'draft',
    updatedAt: new Date().toISOString(),
    category: null,
    evidenceChoice: 'unanswered',
    evidence: null,
    description: '',
    siteId: workerHomeDemo.site.id,
    workAreaId: null,
    answers: {
      anyoneHurt: null,
      anythingDamaged: null,
      environmentalImpact: null,
    },
    source: { type: 'direct' },
  };
}

/** Seeded demo reports shown in My Reports before the worker submits their own. */
export const seedDemoReports: readonly DemoReport[] = [
  {
    reference: 'SF-2045',
    categoryLabel: 'Something unsafe',
    categoryValue: 'unsafe_observation',
    site: workerHomeDemo.site.name,
    workArea: 'Loading bay',
    status: 'under_review',
    submittedAt: '2026-09-22T08:14:00.000Z',
    classification: 'hazard',
    evidenceUri: null,
    evidenceFileName: null,
    description:
      'Loose guardrail bracket near the east loading bay door. Could give way if a vehicle clips it.',
    answers: {
      anyoneHurt: 'no',
      anythingDamaged: 'yes',
      environmentalImpact: 'no',
    },
    timeline: [
      {
        status: 'submitted',
        label: 'Report submitted',
        timestamp: '2026-09-22T08:14:00.000Z',
      },
      {
        status: 'under_review',
        label: 'Under review by HSE',
        timestamp: '2026-09-22T09:30:00.000Z',
      },
    ],
    updates: [
      {
        id: 'upd-sf2045-1',
        body: 'The HSE team has logged this report and a site inspection has been scheduled for this week.',
        postedAt: '2026-09-22T09:31:00.000Z',
      },
    ],
    resolution: null,
  },
  {
    reference: 'SF-2046',
    categoryLabel: 'Something almost happened',
    categoryValue: 'almost_happened',
    site: workerHomeDemo.site.name,
    workArea: 'Vehicle route',
    status: 'action_required',
    submittedAt: '2026-09-20T14:02:00.000Z',
    classification: 'near_miss',
    evidenceUri: null,
    evidenceFileName: null,
    description:
      'A forklift reversed across the pedestrian crossing while I was halfway across. No one hurt but it was very close.',
    answers: {
      anyoneHurt: 'no',
      anythingDamaged: 'no',
      environmentalImpact: 'no',
    },
    timeline: [
      {
        status: 'submitted',
        label: 'Report submitted',
        timestamp: '2026-09-20T14:02:00.000Z',
      },
      {
        status: 'under_review',
        label: 'Under review by HSE',
        timestamp: '2026-09-20T14:45:00.000Z',
      },
      {
        status: 'action_required',
        label: 'More information needed',
        timestamp: '2026-09-21T10:15:00.000Z',
      },
    ],
    updates: [
      {
        id: 'upd-sf2046-1',
        body: 'Thank you for your report. The HSE team is reviewing this incident.',
        postedAt: '2026-09-20T14:46:00.000Z',
      },
      {
        id: 'upd-sf2046-2',
        body: 'We need a few more details. Can you confirm which crossing and approximately what time of day this occurred? Please speak to your site HSE officer.',
        postedAt: '2026-09-21T10:16:00.000Z',
      },
    ],
    resolution: null,
  },
  {
    reference: 'SF-2047',
    categoryLabel: 'Something could harm the environment',
    categoryValue: 'environmental_observation',
    site: workerHomeDemo.site.name,
    workArea: 'Storage area',
    status: 'resolved',
    submittedAt: '2026-09-15T11:30:00.000Z',
    classification: 'environmental_concern',
    evidenceUri: null,
    evidenceFileName: null,
    description:
      'Noticed a slow drip from a drum in Bay 3. Liquid was pooling near the drain. Unsure of contents.',
    answers: {
      anyoneHurt: 'no',
      anythingDamaged: 'not_sure',
      environmentalImpact: 'yes',
    },
    timeline: [
      {
        status: 'submitted',
        label: 'Report submitted',
        timestamp: '2026-09-15T11:30:00.000Z',
      },
      {
        status: 'under_review',
        label: 'Under review by HSE',
        timestamp: '2026-09-15T12:00:00.000Z',
      },
      {
        status: 'resolved',
        label: 'Resolved',
        timestamp: '2026-09-17T09:20:00.000Z',
      },
    ],
    updates: [
      {
        id: 'upd-sf2047-1',
        body: 'Report received. The area has been temporarily cordoned off while the HSE team investigates.',
        postedAt: '2026-09-15T12:01:00.000Z',
      },
      {
        id: 'upd-sf2047-2',
        body: 'The drum has been removed and the area has been cleaned and cleared. No further action required from you.',
        postedAt: '2026-09-17T09:21:00.000Z',
      },
    ],
    resolution: {
      summary:
        'The leaking drum was identified as a used hydraulic fluid container. It was removed and disposed of by a licensed contractor. The drain was inspected and no contamination was detected. Drum storage procedures have been reviewed with the site team.',
      resolvedAt: '2026-09-17T09:20:00.000Z',
    },
  },
];

/** Convert a just-submitted demo report to DemoReport format for My Reports. */
export function submittedToDemoReport(report: SubmittedDemoReport): DemoReport {
  const category = workerReportCategories.find(
    (c) => c.value === report.content.category,
  );
  const area = workerHomeDemo.workAreas.find(
    (a) => a.id === report.content.workAreaId,
  );
  return {
    reference: report.reference,
    categoryLabel: category?.label ?? 'Report',
    categoryValue: report.content.category,
    site: workerHomeDemo.site.name,
    workArea: area?.name ?? null,
    status: 'submitted',
    submittedAt: report.submittedAt,
    classification: null,
    evidenceUri:
      report.content.evidenceChoice === 'photo'
        ? (report.content.evidence?.uri ?? null)
        : null,
    evidenceFileName:
      report.content.evidenceChoice === 'photo'
        ? (report.content.evidence?.fileName ?? null)
        : null,
    description: report.content.description,
    answers: { ...report.content.answers },
    timeline: [
      {
        status: 'submitted',
        label: 'Report submitted',
        timestamp: report.submittedAt,
      },
    ],
    updates: [],
    resolution: null,
    source: report.content.source ?? { type: 'direct' },
  };
}

export function createInitialReportingState(): LocalReportingState {
  return {
    draft: createDraft(),
    submitted: null,
    nextReferenceNumber: 2048,
    demoReports: [...seedDemoReports],
  };
}

export function isDraftStarted(draft: SavedReportDraft): boolean {
  return !!(
    draft.category ||
    draft.description.trim() ||
    draft.evidenceChoice !== 'unanswered' ||
    draft.workAreaId ||
    Object.values(draft.answers).some((answer) => answer !== null)
  );
}

export function reviewIssues(draft: SavedReportDraft): string[] {
  const issues: string[] = [];
  if (!draft.category) issues.push('Choose what you noticed.');
  if (draft.evidenceChoice === 'unanswered')
    issues.push('Choose Take photo, Upload, or Skip.');
  if (draft.evidenceChoice === 'photo' && !draft.evidence)
    issues.push('Add a photo or choose Skip.');
  if (!draft.description.trim()) issues.push('Add a short description.');
  if (!draft.workAreaId) issues.push('Choose a work area.');
  if (Object.values(draft.answers).some((answer) => answer === null))
    issues.push('Answer the additional questions.');
  return issues;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAnswer(value: unknown): value is QuestionAnswer | null {
  return (
    value === null || value === 'yes' || value === 'no' || value === 'not_sure'
  );
}

function isPhoto(value: unknown): value is LocalPhotoEvidence {
  return (
    isRecord(value) &&
    typeof value.uri === 'string' &&
    typeof value.fileName === 'string' &&
    (value.mimeType === null || typeof value.mimeType === 'string') &&
    (value.fileSize === null || typeof value.fileSize === 'number') &&
    typeof value.width === 'number' &&
    typeof value.height === 'number' &&
    (value.source === 'camera' || value.source === 'library')
  );
}

function isContent(value: unknown): value is ReportContent {
  if (!isRecord(value) || !isRecord(value.answers)) return false;
  return (
    (value.category === null ||
      workerReportCategories.some((item) => item.value === value.category)) &&
    (value.evidenceChoice === 'unanswered' ||
      value.evidenceChoice === 'photo' ||
      value.evidenceChoice === 'skipped') &&
    (value.evidence === null || isPhoto(value.evidence)) &&
    typeof value.description === 'string' &&
    value.siteId === workerHomeDemo.site.id &&
    (value.workAreaId === null ||
      workerHomeDemo.workAreas.some((area) => area.id === value.workAreaId)) &&
    isAnswer(value.answers.anyoneHurt) &&
    isAnswer(value.answers.anythingDamaged) &&
    isAnswer(value.answers.environmentalImpact)
  );
}

export function parseReportingState(raw: string): LocalReportingState | null {
  const value: unknown = JSON.parse(raw);
  if (!isRecord(value) || !isRecord(value.draft)) return null;
  const draft = value.draft;
  if (
    draft.kind !== 'draft' ||
    typeof draft.updatedAt !== 'string' ||
    !isContent(draft)
  )
    return null;
  const submitted = value.submitted;
  if (
    submitted !== null &&
    (!isRecord(submitted) ||
      submitted.kind !== 'submitted' ||
      submitted.status !== 'submitted' ||
      typeof submitted.reference !== 'string' ||
      typeof submitted.submittedAt !== 'string' ||
      !isContent(submitted.content))
  )
    return null;
  if (
    !Number.isSafeInteger(value.nextReferenceNumber) ||
    (value.nextReferenceNumber as number) < 2048
  )
    return null;
  // demoReports: restore from storage if present and an array, else start fresh
  const demoReports = Array.isArray(value.demoReports)
    ? (value.demoReports as DemoReport[])
    : [...seedDemoReports];
  return { ...(value as unknown as LocalReportingState), demoReports };
}
