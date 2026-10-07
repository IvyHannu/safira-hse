'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  Bell,
  MapPin,
  Question,
  Translate,
  UserCircle,
  Wheelchair,
} from '@phosphor-icons/react';
import { SignOutButton } from '@/components/ui/sign-out-button';
import {
  DisclosureRow,
  PreferenceToggle,
  ProfileAvatar,
  ProfileCard,
} from '@/components/ui/profile-settings';
import { Select } from '@/components/ui/forms';
import { PageHeader } from '@/components/ui/shell';
import { useAuth } from '@/lib/demo-auth';
import { adminProfile } from '@/data/admin-profile';
import { siteOptions } from '@/data/reports';

const sections = [
  { id: 'personal', label: 'My profile', icon: UserCircle },
  { id: 'scope', label: 'Assigned sites', icon: MapPin },
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
const preferenceEvent = 'safira-admin-profile-preferences';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(preferenceEvent, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(preferenceEvent, callback);
  };
}

export function AdminProfile() {
  const { session, signOut, error } = useAuth();
  const [section, setSection] = useState<Section>('personal');
  const [message, setMessage] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const storageKey = `safira.admin.preferences.v1.${session?.userId || session?.role || 'signed-out'}`;
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
  let preferences: Preferences = defaults;
  try {
    if (saved) preferences = { ...defaults, ...JSON.parse(saved) };
  } catch {
    /* Invalid local preferences fall back to defaults. */
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
      window.dispatchEvent(new Event(preferenceEvent));
      setMessage('Preference saved.');
    } catch {
      setMessage('Your preference could not be saved. Please try again.');
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    window.location.replace('/');
  }

  return (
    <div
      className="admin-profile"
      data-text-size={preferences.textSize}
      data-reduce-motion={preferences.reduceMotion}
    >
      <PageHeader
        title="Profile & Settings"
        description="Your account, site scope and preferences."
      />
      <div
        className="admin-profile-tabs"
        role="tablist"
        aria-label="Profile sections"
      >
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`admin-profile-tab-${id}`}
            role="tab"
            aria-selected={section === id}
            aria-controls="admin-profile-panel"
            onClick={() => {
              setSection(id);
              setMessage('');
            }}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div className="admin-profile-layout">
        <ProfileCard
          as="aside"
          className="admin-profile-identity"
          aria-label="HSE Admin identity"
        >
          <ProfileAvatar
            name={adminProfile.name}
            className="admin-profile-avatar"
          />
          <h2>{adminProfile.name}</h2>
          <p>HSE Admin</p>
          <dl>
            <div>
              <dt>Organisation</dt>
              <dd>{adminProfile.organisation}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>HSE administration across this workspace</dd>
            </div>
          </dl>
          <SignOutButton
            disabled={signingOut && !error}
            onClick={() => void handleSignOut()}
            busy={signingOut && !error}
          />
          {error && (
            <p role="alert" className="admin-profile-error">
              {error}
            </p>
          )}
        </ProfileCard>
        <ProfileCard
          className="admin-profile-panel"
          id="admin-profile-panel"
          role="tabpanel"
          aria-labelledby={`admin-profile-tab-${section}`}
        >
          {section === 'personal' && (
            <>
              <div className="admin-profile-heading">
                <h2>Personal details</h2>
                <p>Your account details in this workspace.</p>
              </div>
              <dl className="admin-profile-details">
                <div>
                  <dt>Full name</dt>
                  <dd>{adminProfile.name}</dd>
                </div>
                <div>
                  <dt>Email address</dt>
                  <dd>{adminProfile.email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>HSE Admin</dd>
                </div>
                <div>
                  <dt>Organisation</dt>
                  <dd>{adminProfile.organisation}</dd>
                </div>
              </dl>
              <p className="admin-profile-note">
                Contact your organisation administrator to change account
                details or access.
              </p>
            </>
          )}
          {section === 'scope' && (
            <>
              <div className="admin-profile-heading">
                <h2>Assigned scope & sites</h2>
                <p>Read-only view of sites in this HSE workspace.</p>
              </div>
              <p className="admin-profile-scope">
                HSE administration across this workspace
              </p>
              <ul className="admin-profile-sites">
                {siteOptions.map((site) => (
                  <li key={site.value}>
                    <MapPin size={17} aria-hidden="true" />
                    {site.label}
                  </li>
                ))}
              </ul>
              <p className="admin-profile-note">
                Site access is managed by your organisation administrator.
              </p>
            </>
          )}
          {section === 'notifications' && (
            <>
              <div className="admin-profile-heading">
                <h2>Notifications & preferences</h2>
                <p>Choose the updates you want to see in this browser.</p>
              </div>
              <PreferenceToggle
                label="Report updates"
                description="Reports requiring assessment or action."
                checked={preferences.reportNotifications}
                onChange={(value) =>
                  updatePreference('reportNotifications', value)
                }
              />
              <PreferenceToggle
                label="Checklist submissions"
                description="New or flagged submissions ready for review."
                checked={preferences.checklistNotifications}
                onChange={(value) =>
                  updatePreference('checklistNotifications', value)
                }
              />
            </>
          )}
          {section === 'accessibility' && (
            <>
              <div className="admin-profile-heading">
                <h2>Accessibility</h2>
                <p>Adjust how this profile is displayed.</p>
              </div>
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
                description="Use fewer interface animations."
                checked={preferences.reduceMotion}
                onChange={(value) => updatePreference('reduceMotion', value)}
              />
            </>
          )}
          {section === 'language' && (
            <>
              <div className="admin-profile-heading">
                <h2>Language</h2>
                <p>Display language for this workspace.</p>
              </div>
              <Select
                label="Display language"
                value={preferences.language}
                onChange={(event) =>
                  updatePreference('language', event.target.value)
                }
              >
                <option value="en">English</option>
              </Select>
            </>
          )}
          {section === 'help' && (
            <>
              <div className="admin-profile-heading">
                <h2>Help & Support</h2>
                <p>Guidance for your HSE workspace.</p>
              </div>
              <DisclosureRow label="Using HSE Admin">
                <p>
                  Review reports, manage checklists and HSE reporting settings,
                  and track action across your sites. Keep internal notes
                  separate from worker-facing updates.
                </p>
              </DisclosureRow>
              <DisclosureRow label="Contact support">
                <p>
                  Contact your organisation administrator for account or site
                  access, or your internal support team for technical help. For
                  immediate danger, follow site emergency procedures first.
                </p>
              </DisclosureRow>
            </>
          )}
          <p role="status" aria-live="polite" className="admin-profile-message">
            {message}
          </p>
        </ProfileCard>
      </div>
    </div>
  );
}
