import type { AuthRole, AuthSession } from '@safira/auth';
import { hasCompletedHseOfficerOnboarding } from './hse-officer-onboarding';
import { hasCompletedHseAdminOnboarding } from './hse-admin-onboarding';
import { hasCompletedOrganisationAdminOnboarding } from './organisation-admin-onboarding';
import { readLocalAdminAccount } from './local-admin-account';

export type AdminRole = Exclude<AuthRole, 'worker'>;

const lastRoleKey = 'safira.admin.last-role.v1';
const roleChangeEvent = 'safira:admin-last-role-changed';

export const adminRoleLabels: Record<AdminRole, string> = {
  hse_officer: 'HSE Officer',
  hse_admin: 'HSE Admin',
  organisation_admin: 'Organisation Admin',
};

export function isAdminRole(role: AuthRole | string | null): role is AdminRole {
  return role !== null && Object.hasOwn(adminRoleLabels, role);
}

export function rememberAdminRole(role: AuthRole) {
  if (!isAdminRole(role)) return;
  try {
    window.localStorage.setItem(lastRoleKey, role);
    window.dispatchEvent(new Event(roleChangeEvent));
  } catch {
    // The active session still controls access when storage is unavailable.
  }
}

export function getStoredAdminRole(): AdminRole | null {
  try {
    const role = window.localStorage.getItem(lastRoleKey);
    return isAdminRole(role) ? role : null;
  } catch {
    return null;
  }
}

export function subscribeStoredAdminRole(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(roleChangeEvent, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(roleChangeEvent, onChange);
  };
}

export function destinationForAdminSession(session: AuthSession) {
  try {
    const email = window.localStorage.getItem(
      'safira.admin.credential-session.v1',
    );
    const localAccount = email ? readLocalAdminAccount(email) : null;
    if (localAccount && !localAccount.profileComplete)
      return '/complete-profile';
  } catch {
    // Continue with the assigned role's onboarding/overview destination.
  }
  switch (session.role) {
    case 'hse_officer':
      return hasCompletedHseOfficerOnboarding(session)
        ? '/hse-officer/overview'
        : '/hse-officer/onboarding';
    case 'hse_admin':
      return hasCompletedHseAdminOnboarding(session)
        ? '/hse-admin/overview'
        : '/hse-admin/onboarding';
    case 'organisation_admin':
      return hasCompletedOrganisationAdminOnboarding(session)
        ? '/organisation-admin/overview'
        : '/organisation-admin/onboarding';
    default:
      return '/sign-in';
  }
}
