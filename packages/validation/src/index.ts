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

export const workerPasswordSchema = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[A-Za-z]/, 'Include at least one letter.')
  .regex(/[0-9]/, 'Include at least one number.');

export const workerActivationSchema = z
  .object({
    password: workerPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const workerSignInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const workerProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  jobTitle: z
    .string()
    .trim()
    .max(80, 'Keep your job title under 80 characters.'),
});
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
