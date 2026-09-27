/** Isolated local fixtures for the Officer checklist review screens. */
export type ChecklistStatus = 'needs_review' | 'reviewed';
export interface ChecklistResponse {
  id: string;
  question: string;
  type: 'yes_no_na' | 'checkbox' | 'single_select' | 'short_text' | 'photo';
  answer: string;
  flagged?: boolean;
  note?: string;
  evidence?: { name: string; url: string | null }[];
  reportId?: string;
}
export interface ChecklistSubmission {
  id: string;
  name: string;
  site: string;
  submittedBy: string;
  submittedAt: string;
  status: ChecklistStatus;
  responses: ChecklistResponse[];
}
export const checklistSubmissions: ChecklistSubmission[] = [
  {
    id: 'CL-0104',
    name: 'Daily Site Inspection',
    site: 'Riverside Logistics',
    submittedBy: 'Amara Smith',
    submittedAt: '2026-09-24T08:17:00',
    status: 'needs_review',
    responses: [
      {
        id: 'walkways',
        question: 'Are site access routes and walkways clear?',
        type: 'yes_no_na',
        answer: 'No',
        flagged: true,
        note: 'Slippery surface at Dock B. Area marked and supervisor notified.',
        evidence: [{ name: 'Dock B surface.jpg', url: null }],
        reportId: 'SF-2050',
      },
      {
        id: 'ppe',
        question: 'Is PPE available and in good condition?',
        type: 'yes_no_na',
        answer: 'Yes',
      },
      {
        id: 'permit',
        question: 'Is a confined space permit required?',
        type: 'yes_no_na',
        answer: 'N/A',
      },
      {
        id: 'checks',
        question: 'Which pre-start checks were completed?',
        type: 'checkbox',
        answer: 'Emergency exits; first aid supplies; fire extinguishers',
      },
      {
        id: 'conditions',
        question: 'What are the ground conditions?',
        type: 'single_select',
        answer: 'Wet',
      },
      {
        id: 'handover',
        question: 'Additional handover notes',
        type: 'short_text',
        answer: 'Dock B remains marked until the surface is made safe.',
      },
      {
        id: 'photo',
        question: 'Site inspection photo',
        type: 'photo',
        answer: '1 photo attached',
        evidence: [{ name: 'Dock B surface.jpg', url: null }],
      },
    ],
  },
  {
    id: 'CL-0103',
    name: 'Hazard Inspection',
    site: 'Harbor Yard',
    submittedBy: 'Daniel Koro',
    submittedAt: '2026-09-23T14:30:00',
    status: 'needs_review',
    responses: [
      {
        id: 'exit',
        question: 'Are emergency exits accessible?',
        type: 'yes_no_na',
        answer: 'No',
        flagged: true,
        note: 'Materials blocking the admin building exit. Supervisor notified.',
        reportId: 'SF-2044',
      },
      {
        id: 'storage',
        question: 'Are materials stored securely?',
        type: 'yes_no_na',
        answer: 'Yes',
      },
    ],
  },
  {
    id: 'CL-0102',
    name: 'Plant Pre-Start Check',
    site: 'North Construction Site',
    submittedBy: 'Mika Kareem',
    submittedAt: '2026-09-22T07:05:00',
    status: 'needs_review',
    responses: [
      {
        id: 'guards',
        question: 'Are equipment guards secure?',
        type: 'yes_no_na',
        answer: 'Yes',
      },
      {
        id: 'notes',
        question: 'Additional notes',
        type: 'short_text',
        answer: 'No issues identified.',
      },
    ],
  },
  {
    id: 'CL-0101',
    name: 'Daily Site Inspection',
    site: 'Harbor Yard',
    submittedBy: 'Sofia Patel',
    submittedAt: '2026-09-20T08:10:00',
    status: 'reviewed',
    responses: [
      {
        id: 'walkways',
        question: 'Are walkways clear?',
        type: 'yes_no_na',
        answer: 'Yes',
      },
      {
        id: 'ppe',
        question: 'Is PPE available?',
        type: 'yes_no_na',
        answer: 'Yes',
      },
    ],
  },
];
export const checklistStatusLabels: Record<ChecklistStatus, string> = {
  needs_review: 'Needs review',
  reviewed: 'Reviewed',
};
export const flaggedCount = (item: ChecklistSubmission) =>
  item.responses.filter((response) => response.flagged).length;
export function checklistDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
