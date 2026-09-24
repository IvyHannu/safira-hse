import { workerHomeDemo } from '@/demo/worker-data';
import type { LocalPhotoEvidence } from '@/reporting/model';

export type ChecklistAnswerValue = 'yes' | 'no' | 'na';

export interface ChecklistItem {
  id: string;
  prompt: string;
  supportsNotes: boolean;
  supportsPhotos: boolean;
  issueTriggerOnNo: boolean;
  workAreaId?: string;
}

export interface ChecklistItemResponse {
  itemId: string;
  answer: ChecklistAnswerValue | null;
  note?: string;
  photo?: LocalPhotoEvidence | null;
  reportedIssueRef?: string;
}

export interface SafetyChecklist {
  id: string;
  title: string;
  description?: string;
  siteId: string;
  siteName: string;
  workAreaId?: string;
  workAreaName?: string;
  assignedToWorker: boolean;
  dueLabel: string;
  status: 'assigned' | 'in_progress' | 'completed';
  items: readonly ChecklistItem[];
  submittedAt?: string;
  responses: Record<string, ChecklistItemResponse>;
}

export interface LocalSafetyState {
  checklists: SafetyChecklist[];
}

export const seedChecklists: readonly SafetyChecklist[] = [
  {
    id: 'chk-shift-start',
    title: 'Start-of-shift area check',
    description:
      'Daily pre-work walkthrough for access, emergency pathways, and immediate safety conditions.',
    siteId: workerHomeDemo.site.id,
    siteName: workerHomeDemo.site.name,
    workAreaId: 'demo-area-loading-bay',
    workAreaName: 'Loading bay',
    assignedToWorker: true,
    dueLabel: 'Due today',
    status: 'assigned',
    items: [
      {
        id: 'chk-item-1',
        prompt: 'Emergency exits and walkways unobstructed and well lit?',
        supportsNotes: true,
        supportsPhotos: true,
        issueTriggerOnNo: true,
        workAreaId: 'demo-area-loading-bay',
      },
      {
        id: 'chk-item-2',
        prompt: 'Spill kits and first aid supplies accessible and intact?',
        supportsNotes: true,
        supportsPhotos: true,
        issueTriggerOnNo: true,
        workAreaId: 'demo-area-loading-bay',
      },
      {
        id: 'chk-item-3',
        prompt: 'Loading bay guardrails and edge barriers secure?',
        supportsNotes: true,
        supportsPhotos: true,
        issueTriggerOnNo: true,
        workAreaId: 'demo-area-loading-bay',
      },
      {
        id: 'chk-item-4',
        prompt: 'Required PPE signs in place and ground markings visible?',
        supportsNotes: true,
        supportsPhotos: true,
        issueTriggerOnNo: true,
        workAreaId: 'demo-area-loading-bay',
      },
    ],
    responses: {},
  },
  {
    id: 'chk-forklift-daily',
    title: 'Forklift pre-operation inspection',
    description:
      'Mandatory daily pre-use safety and functional checks for powered industrial trucks.',
    siteId: workerHomeDemo.site.id,
    siteName: workerHomeDemo.site.name,
    workAreaId: 'demo-area-vehicle-route',
    workAreaName: 'Vehicle route',
    assignedToWorker: true,
    dueLabel: 'Due today',
    status: 'assigned',
    items: [
      {
        id: 'fl-1',
        prompt: 'Tyres and rims free of severe cuts, gouges, or low pressure?',
        supportsNotes: true,
        supportsPhotos: true,
        issueTriggerOnNo: true,
        workAreaId: 'demo-area-vehicle-route',
      },
      {
        id: 'fl-2',
        prompt: 'Seat belt, horn, and reversing beacon operational?',
        supportsNotes: true,
        supportsPhotos: true,
        issueTriggerOnNo: true,
        workAreaId: 'demo-area-vehicle-route',
      },
      {
        id: 'fl-3',
        prompt:
          'Hydraulic cylinders, hoses, and forks free from visible damage or leaks?',
        supportsNotes: true,
        supportsPhotos: true,
        issueTriggerOnNo: true,
        workAreaId: 'demo-area-vehicle-route',
      },
    ],
    responses: {},
  },
  {
    id: 'chk-storage-weekly',
    title: 'Weekly chemical storage check',
    description:
      'Routine storage condition inspection for compliance and spill prevention.',
    siteId: workerHomeDemo.site.id,
    siteName: workerHomeDemo.site.name,
    workAreaId: 'demo-area-storage',
    workAreaName: 'Storage area',
    assignedToWorker: false,
    dueLabel: 'Completed',
    status: 'completed',
    submittedAt: '2026-09-22T07:30:00.000Z',
    items: [
      {
        id: 'chem-1',
        prompt: 'Chemical containers upright, sealed, and clearly labelled?',
        supportsNotes: true,
        supportsPhotos: true,
        issueTriggerOnNo: true,
        workAreaId: 'demo-area-storage',
      },
      {
        id: 'chem-2',
        prompt: 'Secondary containment bunds dry and free of debris?',
        supportsNotes: true,
        supportsPhotos: true,
        issueTriggerOnNo: true,
        workAreaId: 'demo-area-storage',
      },
    ],
    responses: {
      'chem-1': { itemId: 'chem-1', answer: 'yes' },
      'chem-2': {
        itemId: 'chem-2',
        answer: 'yes',
        note: 'Bunding clean and dry.',
      },
    },
  },
];

export function createInitialSafetyState(): LocalSafetyState {
  return {
    checklists: seedChecklists.map((c) => ({
      ...c,
      responses: { ...c.responses },
    })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseSafetyState(raw: string): LocalSafetyState | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || !Array.isArray(value.checklists)) return null;
    return value as unknown as LocalSafetyState;
  } catch {
    return null;
  }
}
