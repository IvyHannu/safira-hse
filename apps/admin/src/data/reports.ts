export type ReportType = 'hazard' | 'near_miss' | 'incident' | 'environmental_concern';
export type Severity = 'low' | 'moderate' | 'high' | 'critical';
export type Status = 'submitted' | 'under_review' | 'action_required' | 'resolved' | 'closed';

export interface ReportListItem {
  id: string;
  title: string;
  type: ReportType;
  site: string;
  severity: Severity;
  status: Status;
  date: string;
}

export interface ReportDetail extends ReportListItem {
  submittedAt: string;
  submittedBy: string;
  description: string;
  evidence: { type: 'photo' | 'document'; url: string; caption: string }[];
  workerAnswers: { question: string; answer: string }[];
  location: { site: string; area: string; coordinates?: string };
  classification: ReportType;
  hseSeverity: Severity;
  assignedTo: string;
  hseStatus: Status;
  workerUpdates: { date: string; message: string; sentBy: string }[];
  internalNotes: { date: string; note: string; author: string }[];
  activity: { date: string; event: string; user: string; details?: string }[];
}

const baseReports: ReportListItem[] = [
  { id: 'SF-2050', title: 'Slip hazard on loading dock', type: 'hazard', site: 'Riverside Logistics — Dock B', severity: 'moderate', status: 'submitted', date: '2026-09-24' },
  { id: 'SF-2049', title: 'Near miss: forklift pedestrian interaction', type: 'near_miss', site: 'Riverside Warehouse — Aisle 12', severity: 'high', status: 'under_review', date: '2026-09-24' },
  { id: 'SF-2048', title: 'Chemical spill near storage tank 3', type: 'environmental_concern', site: 'Riverside Refinery — Tank Farm', severity: 'critical', status: 'action_required', date: '2026-09-23' },
  { id: 'SF-2047', title: 'Oil sheen on retention pond', type: 'environmental_concern', site: 'Riverside Refinery — Pond 2', severity: 'moderate', status: 'submitted', date: '2026-09-23' },
  { id: 'SF-2046', title: 'Damaged fire extinguisher cabinet', type: 'hazard', site: 'North Construction Site — Site Office', severity: 'low', status: 'resolved', date: '2026-09-22' },
  { id: 'SF-2045', title: 'Missing guardrail on elevated walkway', type: 'hazard', site: 'North Construction Site — Level 4', severity: 'high', status: 'under_review', date: '2026-09-22' },
  { id: 'SF-2044', title: 'Blocked emergency exit corridor', type: 'hazard', site: 'Harbor Yard — Admin Building', severity: 'high', status: 'action_required', date: '2026-09-21' },
  { id: 'SF-2043', title: 'Improper chemical storage in warehouse', type: 'environmental_concern', site: 'Harbor Yard — Chemical Storage', severity: 'moderate', status: 'resolved', date: '2026-09-20' },
  { id: 'SF-2042', title: 'Improper PPE observed in welding bay', type: 'hazard', site: 'Harbor Yard — Fabrication Shop', severity: 'moderate', status: 'submitted', date: '2026-09-20' },
  { id: 'SF-2041', title: 'Ladder safety violation on scaffold', type: 'incident', site: 'North Construction Site — Scaffold Area', severity: 'critical', status: 'action_required', date: '2026-09-19' },
  { id: 'SF-2040', title: 'Noise exposure exceedance in compressor room', type: 'hazard', site: 'Riverside Refinery — Compressor Station', severity: 'moderate', status: 'under_review', date: '2026-09-19' },
  { id: 'SF-2039', title: 'Confined space entry without permit', type: 'incident', site: 'Harbor Yard — Tank Interior', severity: 'high', status: 'resolved', date: '2026-09-18' },
  { id: 'SF-2038', title: 'Waste water discharge anomaly detected', type: 'environmental_concern', site: 'Riverside Refinery — Treatment Plant', severity: 'high', status: 'under_review', date: '2026-09-18' },
  { id: 'SF-2037', title: 'Near miss: overhead crane load swing', type: 'near_miss', site: 'North Construction Site — Crane Zone', severity: 'high', status: 'submitted', date: '2026-09-17' },
  { id: 'SF-2036', title: 'Missing fall protection on roof edge', type: 'hazard', site: 'Harbor Yard — Warehouse Roof', severity: 'critical', status: 'action_required', date: '2026-09-17' },
];

function buildDetail(base: ReportListItem): ReportDetail {
  const sites: Record<string, { site: string; area: string; coordinates?: string }> = {
    'Riverside Logistics — Dock B': { site: 'Riverside Logistics', area: 'Dock B', coordinates: '-33.8688, 151.2093' },
    'Riverside Warehouse — Aisle 12': { site: 'Riverside Warehouse', area: 'Aisle 12', coordinates: '-33.8788, 151.2193' },
    'Riverside Refinery — Tank Farm': { site: 'Riverside Refinery', area: 'Tank Farm — Tank 3 Transfer Line', coordinates: '-33.8688, 151.2093' },
    'Riverside Refinery — Pond 2': { site: 'Riverside Refinery', area: 'Pond 2', coordinates: '-33.8588, 151.1993' },
    'North Construction Site — Site Office': { site: 'North Construction Site', area: 'Site Office', coordinates: '-33.8488, 151.1893' },
    'North Construction Site — Level 4': { site: 'North Construction Site', area: 'Level 4', coordinates: '-33.8388, 151.1793' },
    'Harbor Yard — Admin Building': { site: 'Harbor Yard', area: 'Admin Building', coordinates: '-33.8288, 151.1693' },
    'Harbor Yard — Chemical Storage': { site: 'Harbor Yard', area: 'Chemical Storage', coordinates: '-33.8188, 151.1593' },
    'Harbor Yard — Fabrication Shop': { site: 'Harbor Yard', area: 'Fabrication Shop', coordinates: '-33.8088, 151.1493' },
    'North Construction Site — Scaffold Area': { site: 'North Construction Site', area: 'Scaffold Area', coordinates: '-33.8388, 151.1793' },
    'Riverside Refinery — Compressor Station': { site: 'Riverside Refinery', area: 'Compressor Station', coordinates: '-33.8688, 151.2093' },
    'Harbor Yard — Tank Interior': { site: 'Harbor Yard', area: 'Tank Interior', coordinates: '-33.8188, 151.1593' },
    'Riverside Refinery — Treatment Plant': { site: 'Riverside Refinery', area: 'Treatment Plant', coordinates: '-33.8588, 151.1993' },
    'North Construction Site — Crane Zone': { site: 'North Construction Site', area: 'Crane Zone', coordinates: '-33.8388, 151.1793' },
    'Harbor Yard — Warehouse Roof': { site: 'Harbor Yard', area: 'Warehouse Roof', coordinates: '-33.8088, 151.1493' },
  };

  const siteInfo = sites[base.site] || { site: base.site, area: base.site };

  const typeDescriptions: Record<string, string> = {
    'hazard': 'Safety hazard observed',
    'near_miss': 'Near miss incident',
    'incident': 'Safety incident occurred',
    'environmental_concern': 'Environmental concern',
  };

  const typeQuestions: Record<ReportType, { question: string; answer: string }[]> = {
    hazard: [
      { question: 'What were you doing when you discovered the issue?', answer: 'Performing routine inspection when hazard was identified' },
      { question: 'Immediate actions taken?', answer: 'Area cordoned off, warning signs posted, supervisor notified' },
      { question: 'Any injuries or exposures?', answer: 'No injuries reported' },
      { question: 'Weather conditions?', answer: 'Clear, 22°C, light winds' },
    ],
    near_miss: [
      { question: 'What happened?', answer: 'Near miss occurred during normal operations' },
      { question: 'What prevented a more serious outcome?', answer: 'Quick reaction by operator, existing safeguards functioned' },
      { question: 'Any injuries?', answer: 'No injuries' },
      { question: 'Conditions at the time?', answer: 'Normal operating conditions' },
    ],
    incident: [
      { question: 'What occurred?', answer: 'Incident occurred during work activities' },
      { question: 'Immediate response?', answer: 'Emergency procedures followed, area secured' },
      { question: 'Injuries or damage?', answer: 'Minor injury treated on site, equipment damage assessed' },
      { question: 'Contributing factors?', answer: 'Under investigation' },
    ],
    environmental_concern: [
      { question: 'What were you doing when you discovered the issue?', answer: 'Monitoring operations when anomaly detected' },
      { question: 'Immediate actions taken?', answer: 'Containment activated, authorities notified per procedure' },
      { question: 'Any environmental impact?', answer: 'Limited impact, containment successful' },
      { question: 'Weather conditions?', answer: 'Light rain, 18°C, wind from SW at 15 km/h' },
    ],
  };

  const typeEvidence: Record<ReportType, { type: 'photo' | 'document'; url: string; caption: string }[]> = {
    hazard: [
      { type: 'photo', url: '/placeholder-hazard-1.jpg', caption: 'Hazard area showing risk' },
      { type: 'photo', url: '/placeholder-hazard-2.jpg', caption: 'Close-up of hazard condition' },
    ],
    near_miss: [
      { type: 'photo', url: '/placeholder-nearmiss-1.jpg', caption: 'Scene of near miss' },
      { type: 'document', url: '/placeholder-nearmiss-report.pdf', caption: 'Near miss report form' },
    ],
    incident: [
      { type: 'photo', url: '/placeholder-incident-1.jpg', caption: 'Incident scene' },
      { type: 'document', url: '/placeholder-incident-report.pdf', caption: 'Incident report form' },
    ],
    environmental_concern: [
      { type: 'photo', url: '/placeholder-env-1.jpg', caption: 'Environmental concern area' },
      { type: 'photo', url: '/placeholder-env-2.jpg', caption: 'Containment measures' },
      { type: 'document', url: '/placeholder-env-sds.pdf', caption: 'Safety data sheet' },
    ],
  };

  const dateObj = new Date(base.date);
  const submittedAt = new Date(dateObj.getTime() - Math.random() * 4 * 60 * 60 * 1000).toISOString();

  const workers = ['Marcus Webb', 'James Park', 'Lisa Wong', 'Sarah Chen', 'Robert Kim', 'Emma Davis', 'David Liu', 'Anna Patel'];
  const submittedBy = workers[Math.floor(Math.random() * workers.length)];

  const hseOfficers = ['Sarah Chen (HSE Officer)', 'James Park (HSE Officer)', 'Lisa Wong (HSE Admin)'];
  const assignedTo = hseOfficers[Math.floor(Math.random() * hseOfficers.length)];

  return {
    ...base,
    submittedAt,
    submittedBy,
    description: `${typeDescriptions[base.type]}: ${base.title} at ${base.site}. ${base.type === 'environmental_concern' ? 'Environmental controls activated.' : base.type === 'incident' ? 'Incident response procedures followed.' : 'Area secured and assessed.'}`,
    evidence: typeEvidence[base.type],
    workerAnswers: typeQuestions[base.type],
    location: { site: siteInfo.site, area: siteInfo.area, coordinates: siteInfo.coordinates },
    classification: base.type,
    hseSeverity: base.severity,
    assignedTo,
    hseStatus: base.status,
    workerUpdates: [],
    internalNotes: [],
    activity: [
      { date: submittedAt, event: 'Report submitted', user: submittedBy, details: 'Worker submitted report via mobile app' },
    ],
  };
}

export const reportData: Record<string, ReportDetail> = Object.fromEntries(
  baseReports.map((r) => [r.id, buildDetail(r)])
);

export const reportList: ReportListItem[] = baseReports;

export const statusOptions: { value: Status; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'action_required', label: 'Action Required' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export const severityOptions: { value: Severity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const typeOptions: { value: ReportType; label: string }[] = [
  { value: 'hazard', label: 'Hazard' },
  { value: 'near_miss', label: 'Near Miss' },
  { value: 'incident', label: 'Incident' },
  { value: 'environmental_concern', label: 'Environmental Concern' },
];

export const siteOptions = [
  { value: 'riverside_logistics', label: 'Riverside Logistics' },
  { value: 'riverside_warehouse', label: 'Riverside Warehouse' },
  { value: 'riverside_refinery', label: 'Riverside Refinery' },
  { value: 'north_construction', label: 'North Construction Site' },
  { value: 'harbor_yard', label: 'Harbor Yard' },
];

export const assigneeOptions = [
  { value: 'sarah_chen', label: 'Sarah Chen (HSE Officer)' },
  { value: 'james_park', label: 'James Park (HSE Officer)' },
  { value: 'lisa_wong', label: 'Lisa Wong (HSE Admin)' },
  { value: 'unassigned', label: 'Unassigned' },
];