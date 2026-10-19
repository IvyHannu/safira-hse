import type { AuthSession } from '@safira/auth';

const storagePrefix = 'safira.hse-admin.onboarding.v1';
const changeEvent = 'safira:hse-admin-onboarding-changed';

function storageKey(session: AuthSession) {
  return `${storagePrefix}.${session.userId ?? 'local-account'}`;
}

export function hasCompletedHseAdminOnboarding(session: AuthSession) {
  if (session.role !== 'hse_admin') return false;
  try {
    return window.localStorage.getItem(storageKey(session)) === 'complete';
  } catch {
    return false;
  }
}

export function completeHseAdminOnboarding(session: AuthSession) {
  if (session.role !== 'hse_admin') return false;
  try {
    window.localStorage.setItem(storageKey(session), 'complete');
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch {
    return false;
  }
}

export function subscribeHseAdminOnboarding(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}
