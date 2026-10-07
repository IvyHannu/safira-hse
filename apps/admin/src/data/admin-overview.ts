// Overview reads existing isolated fixtures; these aggregates never grant organisation/site access.
import { reportList } from './reports';
import { checklistSubmissions, flaggedCount } from './checklists';
export const overviewReports = reportList;
export const overviewChecklistSummary = {
  submitted: checklistSubmissions.length,
  needsReview: checklistSubmissions.filter(
    (item) => item.status === 'needs_review',
  ).length,
  flagged: checklistSubmissions.filter((item) => flaggedCount(item) > 0).length,
};
export const overviewSnapshotDate =
  reportList
    .map((report) => report.date)
    .sort()
    .at(-1) || '';
