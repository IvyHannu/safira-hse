import type { ReportStatus } from '@safira/types';

export interface WorkerHomeDemoData {
  worker: { firstName: string };
  site: { id: string; name: string; area: string };
  workAreas: readonly { id: string; name: string }[];
  latestReport: {
    reference: string;
    title: string;
    status: ReportStatus;
    updatedLabel: string;
  };
  assignedChecklist: {
    title: string;
    dueLabel: string;
    locationLabel: string;
  };
  activeSafetyAlert: { title: string; message: string } | null;
}

/** Prototype fixtures only. Never use these values as a database identity. */
export const workerHomeDemo: WorkerHomeDemoData = {
  worker: { firstName: 'Amara' },
  site: {
    id: 'demo-site-north-yard',
    name: 'North Yard',
    area: 'Loading and dispatch',
  },
  workAreas: [
    { id: 'demo-area-loading-bay', name: 'Loading bay' },
    { id: 'demo-area-storage', name: 'Storage area' },
    { id: 'demo-area-vehicle-route', name: 'Vehicle route' },
    { id: 'demo-area-other', name: 'Other area' },
  ],
  latestReport: {
    reference: 'RPT-000147',
    title: 'Loose guardrail near the loading bay',
    status: 'under_review',
    updatedLabel: 'Updated today',
  },
  assignedChecklist: {
    title: 'Start-of-shift area check',
    dueLabel: 'Due today',
    locationLabel: 'North Yard',
  },
  activeSafetyAlert: {
    title: 'Temporary walkway change',
    message:
      'At North Yard, follow the marked pedestrian route near the loading bay.',
  },
};

export type WorkerReportCategoryValue =
  | 'unsafe_observation'
  | 'almost_happened'
  | 'event_happened'
  | 'environmental_observation';

export interface WorkerReportCategory {
  value: WorkerReportCategoryValue;
  label: string;
  description: string;
}

/** Worker-facing choices remain separate from later HSE classification. */
export const workerReportCategories: readonly WorkerReportCategory[] = [
  {
    value: 'unsafe_observation',
    label: 'Something unsafe',
    description: 'A condition or behaviour that could cause harm.',
  },
  {
    value: 'almost_happened',
    label: 'Something almost happened',
    description: 'Something went wrong, but no one was hurt.',
  },
  {
    value: 'event_happened',
    label: 'Something happened',
    description: 'Someone was hurt, or something was damaged.',
  },
  {
    value: 'environmental_observation',
    label: 'Something could harm the environment',
    description: 'A spill, leak, waste issue, or similar concern.',
  },
];
