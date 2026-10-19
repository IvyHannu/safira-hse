import type { AuthSession } from '@safira/auth';

const storagePrefix = 'safira.organisation-admin.onboarding.v1';
const changeEvent = 'safira:organisation-admin-onboarding-changed';

function storageKey(session: AuthSession) {
  return `${storagePrefix}.${session.userId ?? 'local-account'}`;
}

export function hasCompletedOrganisationAdminOnboarding(session: AuthSession) {
  if (session.role !== 'organisation_admin') return false;
  try {
    return window.localStorage.getItem(storageKey(session)) === 'complete';
  } catch {
    return false;
  }
}

export function completeOrganisationAdminOnboarding(session: AuthSession) {
  if (session.role !== 'organisation_admin') return false;
  try {
    window.localStorage.setItem(storageKey(session), 'complete');
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch {
    return false;
  }
}

export function subscribeOrganisationAdminOnboarding(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}
