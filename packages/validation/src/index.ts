import { z } from 'zod';

export const semanticStatusSchema = z.enum([
  'success',
  'warning',
  'critical',
  'information',
]);
export type SemanticStatusInput = z.infer<typeof semanticStatusSchema>;

export const organisationRoleSchema = z.enum([
  'worker',
  'hse_officer',
  'hse_admin',
  'organisation_admin',
]);
export const reportStatusSchema = z.enum([
  'submitted',
  'under_review',
  'action_required',
  'resolved',
  'closed',
]);
export const reportSeveritySchema = z.enum([
  'low',
  'moderate',
  'high',
  'critical',
]);
export const hseClassificationSchema = z.enum([
  'hazard',
  'near_miss',
  'incident',
  'environmental_concern',
]);
export const checklistStatusSchema = z.enum(['draft', 'active', 'archived']);
