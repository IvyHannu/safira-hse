import type { WorkerReportCategoryValue } from '@/demo/worker-data';
import { workerHomeDemo, workerReportCategories } from '@/demo/worker-data';

export type QuestionAnswer = 'yes' | 'no' | 'not_sure';
export type QuestionKey =
  'anyoneHurt' | 'anythingDamaged' | 'environmentalImpact';
export type ReportAnswers = Record<QuestionKey, QuestionAnswer | null>;

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
  };
}

export function createInitialReportingState(): LocalReportingState {
  return { draft: createDraft(), submitted: null, nextReferenceNumber: 2048 };
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
  return value as unknown as LocalReportingState;
}
