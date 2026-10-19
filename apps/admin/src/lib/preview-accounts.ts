import type { AdminRole } from './admin-access';

// Local preview identities only. Production authentication must replace this list.
const previewPassword = 'SafiraPreview!2026';

const previewAccounts: ReadonlyArray<{ email: string; role: AdminRole }> = [
  { email: 'officer@safira.local', role: 'hse_officer' },
  { email: 'hse-admin@safira.local', role: 'hse_admin' },
  { email: 'organisation-admin@safira.local', role: 'organisation_admin' },
];

export function verifyPreviewAccount(email: string, password: string) {
  if (password !== previewPassword) return null;
  return (
    previewAccounts.find(
      (account) => account.email === email.trim().toLowerCase(),
    ) ?? null
  );
}

export function getPreviewAccountForRole(role: AdminRole) {
  return previewAccounts.find((account) => account.role === role) ?? null;
}

export function getPreviewAccountByEmail(email: string) {
  return (
    previewAccounts.find(
      (account) => account.email === email.trim().toLowerCase(),
    ) ?? null
  );
}
