import type { AuthSession } from '@safira/auth';

const storagePrefix = 'safira.hse-officer.onboarding.v1';
const changeEvent = 'safira:hse-officer-onboarding-changed';

function storageKey(session: AuthSession) {
  return `${storagePrefix}.${session.userId ?? 'local-account'}`;
}

export function hasCompletedHseOfficerOnboarding(session: AuthSession) {
  if (session.role !== 'hse_officer') return false;
  try {
    return window.localStorage.getItem(storageKey(session)) === 'complete';
  } catch {
    return false;
  }
}

export function completeHseOfficerOnboarding(session: AuthSession) {
  if (session.role !== 'hse_officer') return false;
  try {
    window.localStorage.setItem(storageKey(session), 'complete');
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch {
    return false;
  }
}

export function subscribeHseOfficerOnboarding(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}
