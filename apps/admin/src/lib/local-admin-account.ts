import type { AdminRole } from './admin-access';

/** Isolated browser-only account preview. A real auth provider will replace it. */
export interface LocalAdminAccount {
  email: string;
  role: AdminRole;
  organisation: string;
  site?: string;
  fullName: string;
  jobTitle: string;
  photoUrl?: string;
  passwordSalt: string;
  passwordDigest: string;
  profileComplete: boolean;
}

const accountsKey = 'safira.admin.local-accounts.v1';

export const adminInvitations = [
  {
    code: 'safira-hse-officer-preview',
    email: 'officer@safira.local',
    role: 'hse_officer',
    organisation: 'Riverside Group',
    site: 'North Yard',
  },
  {
    code: 'safira-hse-admin-preview',
    email: 'hse-admin@safira.local',
    role: 'hse_admin',
    organisation: 'Riverside Group',
  },
  {
    code: 'safira-organisation-admin-preview',
    email: 'organisation-admin@safira.local',
    role: 'organisation_admin',
    organisation: 'Riverside Group',
  },
] as const;

export function getAdminInvitation(code: string | null | undefined) {
  return (
    adminInvitations.find((invitation) => invitation.code === code) ?? null
  );
}

export function readLocalAdminAccount(email: string): LocalAdminAccount | null {
  try {
    const raw = window.localStorage.getItem(accountsKey);
    if (!raw) return null;
    const accounts: unknown = JSON.parse(raw);
    if (!accounts || typeof accounts !== 'object') return null;
    const account = (accounts as Record<string, unknown>)[email.toLowerCase()];
    if (!account || typeof account !== 'object') return null;
    const value = account as Partial<LocalAdminAccount>;
    return typeof value.email === 'string' &&
      typeof value.role === 'string' &&
      typeof value.passwordSalt === 'string' &&
      typeof value.passwordDigest === 'string' &&
      typeof value.profileComplete === 'boolean'
      ? (value as LocalAdminAccount)
      : null;
  } catch {
    return null;
  }
}

export function saveLocalAdminAccount(account: LocalAdminAccount) {
  const raw = window.localStorage.getItem(accountsKey);
  const accounts = raw
    ? (JSON.parse(raw) as Record<string, LocalAdminAccount>)
    : {};
  accounts[account.email.toLowerCase()] = account;
  window.localStorage.setItem(accountsKey, JSON.stringify(accounts));
}

async function digest(salt: string, password: string) {
  const input = new TextEncoder().encode(`${salt}:${password}`);
  const hash = await window.crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export async function createLocalPassword(password: string) {
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return { salt, digest: await digest(salt, password) };
}

export async function matchesLocalPassword(
  account: LocalAdminAccount,
  password: string,
) {
  return (
    (await digest(account.passwordSalt, password)) === account.passwordDigest
  );
}
