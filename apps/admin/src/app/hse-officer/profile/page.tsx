'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  MapPin,
  UserCircle,
  Bell,
  Wheelchair,
  Translate,
  Question,
} from '@phosphor-icons/react';
import { Select } from '@/components/hse-officer/ui';
import {
  DisclosureRow,
  PreferenceToggle,
  ProfileCard,
  ProfileIdentity,
  ProfileSectionNav,
} from '@/components/ui/profile-settings';
import { PageHeader } from '@/components/ui/shell';
import { useAuth } from '@/lib/demo-auth';
import { officerProfile } from '@/data/officer-profile';

const sections = [
  { id: 'personal', label: 'Personal details', icon: UserCircle },
  { id: 'sites', label: 'Assigned sites', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'accessibility', label: 'Accessibility', icon: Wheelchair },
  { id: 'language', label: 'Language', icon: Translate },
  { id: 'help', label: 'Help & Support', icon: Question },
] as const;
type Section = (typeof sections)[number]['id'];

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
export default function ProfilePage() {
  const { session, account } = useAuth();
  const [section, setSection] = useState<Section>('personal');
  const [message, setMessage] = useState('');
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
      <ProfileIdentity
        name={account?.fullName || officerProfile.name}
        role="HSE Officer"
        context={account?.organisation || officerProfile.organisation}
        photoUrl={account?.photoUrl}
      />
      <div className="grid min-w-0 items-start gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        <ProfileSectionNav
          selectionStyle="neutral"
          items={sections.map(({ id, label, icon: Icon }) => ({
            id,
            label,
            icon: <Icon size={20} aria-hidden="true" />,
          }))}
          selected={section}
          onSelect={setSection}
          idPrefix="officer-profile-tab"
          panelId="officer-profile-panel"
        />
        <div
          id="officer-profile-panel"
          role="region"
          aria-labelledby={`officer-profile-tab-${section}`}
          className="grid min-w-0 content-start gap-4"
        >
          {section === 'sites' && (
            <ProfileCard
              className="officer-section"
              aria-labelledby="sites-title"
            >
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
            </ProfileCard>
          )}
          {section === 'personal' && (
            <ProfileCard
              className="officer-section"
              aria-labelledby="personal-title"
            >
              <h2 id="personal-title" className="flex items-center gap-2">
                <UserCircle size={20} aria-hidden="true" />
                Personal details
              </h2>
              <dl className="mt-3 grid gap-3 text-sm">
                <div>
                  <dt className="text-xs text-graphite/70">Full name</dt>
                  <dd>{account?.fullName || officerProfile.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-graphite/70">Email</dt>
                  <dd className="break-all">
                    {account?.email || officerProfile.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-graphite/70">Role</dt>
                  <dd>HSE Officer</dd>
                </div>
              </dl>
            </ProfileCard>
          )}
          {section === 'notifications' && (
            <ProfileCard
              id="notifications"
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
            </ProfileCard>
          )}
          {section === 'accessibility' && (
            <ProfileCard
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
            </ProfileCard>
          )}
          {section === 'language' && (
            <ProfileCard
              className="officer-section"
              aria-labelledby="language-title"
            >
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
            </ProfileCard>
          )}
          {section === 'help' && (
            <ProfileCard
              className="officer-section"
              aria-labelledby="help-title"
            >
              <h2 id="help-title" className="flex items-center gap-2">
                <Question size={20} aria-hidden="true" />
                Help & Support
              </h2>
              <DisclosureRow label="Using your Officer workspace">
                <p className="pb-3 text-sm text-graphite/70">
                  Review reports, assess classification and severity, record
                  actions and review checklist submissions for your assigned
                  sites. Keep internal notes separate from worker-facing
                  updates.
                </p>
              </DisclosureRow>
              <DisclosureRow label="Contact support">
                <p className="pb-3 text-sm text-graphite/70">
                  Contact your organisation administrator for account,
                  site-access or technical support. For immediate danger, follow
                  site emergency procedures first.
                </p>
              </DisclosureRow>
            </ProfileCard>
          )}
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
