'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  SignOut,
  UserCircle,
  Bell,
  Wheelchair,
  Translate,
  Question,
} from '@phosphor-icons/react';
import { Button, Select } from '@/components/hse-officer/ui';
import { PageHeader } from '@/components/ui/shell';
import { useAuth } from '@/lib/demo-auth';
import { officerProfile } from '@/data/officer-profile';

const defaults = {
  reportNotifications: true,
  checklistNotifications: true,
  textSize: 'standard',
  reduceMotion: false,
  language: 'en',
};
type Preferences = typeof defaults;
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('officer-preferences', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('officer-preferences', callback);
  };
}
function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 border-b border-graphite/10 py-3 last:border-0">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-graphite/70">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-deepCharcoal"
      />
    </label>
  );
}
export default function ProfilePage() {
  const router = useRouter();
  const { session, signOut, error } = useAuth();
  const [message, setMessage] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const storageKey = `safira.officer.preferences.v1.${session?.userId || session?.role || 'signed-out'}`;
  const saved = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(storageKey);
      } catch {
        return null;
      }
    },
    () => null,
  );
  let preferences = defaults;
  try {
    if (saved) preferences = { ...defaults, ...JSON.parse(saved) };
  } catch {
    /* Use defaults if saved preferences cannot be read. */
  }
  function updatePreference<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ ...preferences, [key]: value }),
      );
      window.dispatchEvent(new Event('officer-preferences'));
      setMessage('Preference saved.');
    } catch {
      setMessage('Your preference could not be saved. Please try again.');
    }
  }
  useEffect(() => {
    if (signingOut && !session && !error) router.replace('/');
  }, [signingOut, session, error, router]);
  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }
  return (
    <div
      className="officer-profile grid min-w-0 gap-4"
      data-text-size={preferences.textSize}
      data-reduce-motion={preferences.reduceMotion}
    >
      <PageHeader
        title="Profile"
        description="Your details, site access and preferences."
      />
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.7fr)]">
        <div className="grid min-w-0 gap-4">
          <section className="officer-section" aria-labelledby="officer-name">
            <div className="flex items-center gap-3">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-coolSurface text-xl font-semibold"
                aria-label={`${officerProfile.name} avatar`}
              >
                {officerProfile.initials}
              </span>
              <div className="min-w-0">
                <h2 id="officer-name">{officerProfile.name}</h2>
                <p className="text-sm text-graphite/70">HSE Officer</p>
              </div>
            </div>
            <dl className="mt-4 border-t border-graphite/10 pt-3">
              <dt className="text-xs text-graphite/70">Organisation</dt>
              <dd className="mt-1 text-sm font-medium">
                {officerProfile.organisation}
              </dd>
            </dl>
          </section>
          <section className="officer-section" aria-labelledby="sites-title">
            <h2 id="sites-title" className="flex items-center gap-2">
              <MapPin size={20} aria-hidden="true" />
              Assigned sites
            </h2>
            <p className="mt-1 text-xs text-graphite/70">
              Sites you can review. Contact your organisation administrator to
              request a change.
            </p>
            <ul className="mt-2 divide-y divide-graphite/10">
              {officerProfile.sites.map((site) => (
                <li key={site} className="py-3 text-sm">
                  {site}
                </li>
              ))}
            </ul>
          </section>
          <section className="officer-section" aria-labelledby="personal-title">
            <h2 id="personal-title" className="flex items-center gap-2">
              <UserCircle size={20} aria-hidden="true" />
              Personal details
            </h2>
            <dl className="mt-3 grid gap-3 text-sm">
              <div>
                <dt className="text-xs text-graphite/70">Full name</dt>
                <dd>{officerProfile.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-graphite/70">Email</dt>
                <dd className="break-all">{officerProfile.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-graphite/70">Role</dt>
                <dd>HSE Officer</dd>
              </div>
            </dl>
          </section>
          <Button
            variant="secondary"
            className="min-h-12 justify-center"
            disabled={signingOut && !error}
            onClick={() => void handleSignOut()}
          >
            <SignOut size={20} aria-hidden="true" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Button>
          {error && (
            <p role="alert" className="text-sm text-critical">
              {error}
            </p>
          )}
        </div>
        <div className="grid min-w-0 gap-4">
          <section
            className="officer-section"
            aria-labelledby="notifications-title"
          >
            <h2 id="notifications-title" className="flex items-center gap-2">
              <Bell size={20} aria-hidden="true" />
              Notifications & preferences
            </h2>
            <PreferenceToggle
              label="Report updates"
              description="Updates for reports at your assigned sites."
              checked={preferences.reportNotifications}
              onChange={(value) =>
                updatePreference('reportNotifications', value)
              }
            />
            <PreferenceToggle
              label="Checklist submissions"
              description="New submissions ready for review."
              checked={preferences.checklistNotifications}
              onChange={(value) =>
                updatePreference('checklistNotifications', value)
              }
            />
          </section>
          <section
            className="officer-section"
            aria-labelledby="accessibility-title"
          >
            <h2
              id="accessibility-title"
              className="mb-3 flex items-center gap-2"
            >
              <Wheelchair size={20} aria-hidden="true" />
              Accessibility
            </h2>
            <Select
              label="Text size"
              value={preferences.textSize}
              onChange={(event) =>
                updatePreference('textSize', event.target.value)
              }
            >
              <option value="standard">Standard</option>
              <option value="large">Large</option>
            </Select>
            <PreferenceToggle
              label="Reduce motion"
              description="Prefer fewer interface animations."
              checked={preferences.reduceMotion}
              onChange={(value) => updatePreference('reduceMotion', value)}
            />
          </section>
          <section className="officer-section" aria-labelledby="language-title">
            <h2 id="language-title" className="mb-3 flex items-center gap-2">
              <Translate size={20} aria-hidden="true" />
              Language
            </h2>
            <Select
              label="Display language"
              value={preferences.language}
              onChange={(event) =>
                updatePreference('language', event.target.value)
              }
            >
              <option value="en">English</option>
            </Select>
          </section>
          <section className="officer-section" aria-labelledby="help-title">
            <h2 id="help-title" className="flex items-center gap-2">
              <Question size={20} aria-hidden="true" />
              Help & Support
            </h2>
            <details className="mt-2 border-b border-graphite/10">
              <summary className="min-h-12 cursor-pointer py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-information">
                Using your Officer workspace
              </summary>
              <p className="pb-3 text-sm text-graphite/70">
                Review reports, assess classification and severity, record
                actions and review checklist submissions for your assigned
                sites. Keep internal notes separate from worker-facing updates.
              </p>
            </details>
            <details>
              <summary className="min-h-12 cursor-pointer py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-information">
                Contact support
              </summary>
              <p className="pb-3 text-sm text-graphite/70">
                Contact your organisation administrator for account, site-access
                or technical support. For immediate danger, follow site
                emergency procedures first.
              </p>
            </details>
          </section>
          <p
            role="status"
            aria-live="polite"
            className="min-h-5 text-sm text-graphite/70"
          >
            {message}
          </p>
        </div>
      </div>
      <style jsx global>{`
        .officer-profile[data-text-size='large']
          :is(p, dd, li, label, summary, select) {
          font-size: 1rem;
        }
        .officer-profile[data-reduce-motion='true'] * {
          transition: none !important;
          animation: none !important;
        }
      `}</style>
    </div>
  );
}
