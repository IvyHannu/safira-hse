'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  Bell,
  Question,
  Translate,
  UserCircle,
  Wheelchair,
} from '@phosphor-icons/react';
import {
  DisclosureRow,
  PreferenceToggle,
  ProfileCard,
  ProfileIdentity,
  ProfileSectionNav,
} from '@/components/ui/profile-settings';
import { Select } from '@/components/ui/forms';
import { PageHeader } from '@/components/ui/shell';
import { useAuth } from '@/lib/demo-auth';
import { adminProfile } from '@/data/admin-profile';
import { useOrganisationSettings } from './organisation-settings-store';
import './organisation-profile.css';

const sections = [
  { id: 'personal', label: 'Personal details', icon: UserCircle },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'accessibility', label: 'Accessibility', icon: Wheelchair },
  { id: 'language', label: 'Language', icon: Translate },
  { id: 'help', label: 'Help & Support', icon: Question },
] as const;
type Section = (typeof sections)[number]['id'];

interface ProfilePreferences {
  invitationUpdates: boolean;
  accessUpdates: boolean;
  textSize: 'standard' | 'large';
  reduceMotion: boolean;
  language: 'en';
}
const defaults: ProfilePreferences = {
  invitationUpdates: true,
  accessUpdates: true,
  textSize: 'standard',
  reduceMotion: false,
  language: 'en',
};
const preferenceEvent = 'safira-organisation-profile-preferences';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(preferenceEvent, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(preferenceEvent, callback);
  };
}

function readPreferences(value: string | null): ProfilePreferences {
  if (!value) return defaults;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return defaults;
    const record = parsed as Record<string, unknown>;
    return {
      invitationUpdates:
        typeof record.invitationUpdates === 'boolean'
          ? record.invitationUpdates
          : defaults.invitationUpdates,
      accessUpdates:
        typeof record.accessUpdates === 'boolean'
          ? record.accessUpdates
          : defaults.accessUpdates,
      textSize: record.textSize === 'large' ? 'large' : 'standard',
      reduceMotion:
        typeof record.reduceMotion === 'boolean'
          ? record.reduceMotion
          : defaults.reduceMotion,
      language: 'en',
    };
  } catch {
    return defaults;
  }
}

export function OrganisationProfile() {
  const { session, account } = useAuth();
  const organisation = useOrganisationSettings();
  const [section, setSection] = useState<Section>('personal');
  const [message, setMessage] = useState('');
  const key = `safira.organisation.profile.preferences.v1.${session?.userId || session?.role || 'signed-out'}`;
  const saved = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
  const preferences = readPreferences(saved);

  function updatePreference<K extends keyof ProfilePreferences>(
    name: K,
    value: ProfilePreferences[K],
  ) {
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify({ ...preferences, [name]: value }),
      );
      window.dispatchEvent(new Event(preferenceEvent));
      setMessage('Preference saved.');
    } catch {
      setMessage('Your preference could not be saved. Please try again.');
    }
  }

  return (
    <div
      className="organisation-profile"
      data-text-size={preferences.textSize}
      data-reduce-motion={preferences.reduceMotion}
    >
      <PageHeader
        title="Profile"
        description="Your account details and workspace preferences."
      />
      <ProfileIdentity
        name={account?.fullName || adminProfile.name}
        role="Organisation Admin"
        context={organisation.name}
        photoUrl={account?.photoUrl}
      />
      <div className="grid min-w-0 items-start gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        <ProfileSectionNav
          items={sections.map(({ id, label, icon: Icon }) => ({
            id,
            label,
            icon: <Icon size={20} aria-hidden="true" />,
          }))}
          selected={section}
          selectionStyle="neutral"
          onSelect={(value) => {
            setSection(value);
            setMessage('');
          }}
          idPrefix="organisation-profile-tab"
          panelId="organisation-profile-panel"
        />
        <ProfileCard
          className="grid min-w-0 content-start gap-3"
          id="organisation-profile-panel"
          role="region"
          aria-labelledby={`organisation-profile-tab-${section}`}
        >
          {section === 'personal' && (
            <>
              <div className="organisation-profile-heading">
                <h2>Personal details</h2>
                <p>Your account details in this workspace.</p>
              </div>
              <dl className="organisation-profile-details">
                <div>
                  <dt>Full name</dt>
                  <dd>{account?.fullName || adminProfile.name}</dd>
                </div>
                <div>
                  <dt>Email address</dt>
                  <dd>{account?.email || adminProfile.email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>Organisation Admin</dd>
                </div>
                <div>
                  <dt>Organisation</dt>
                  <dd>{organisation.name}</dd>
                </div>
              </dl>
              <p className="organisation-profile-note">
                Account details are managed through your organisation’s access
                process.
              </p>
            </>
          )}
          {section === 'notifications' && (
            <>
              <div className="organisation-profile-heading">
                <h2>Notifications & preferences</h2>
                <p>Choose the organisation updates you want to see.</p>
              </div>
              <PreferenceToggle
                label="Invitation updates"
                description="Pending invitations and new members."
                checked={preferences.invitationUpdates}
                onChange={(value) =>
                  updatePreference('invitationUpdates', value)
                }
              />
              <PreferenceToggle
                label="Access updates"
                description="Site and role access changes that need review."
                checked={preferences.accessUpdates}
                onChange={(value) => updatePreference('accessUpdates', value)}
              />
            </>
          )}
          {section === 'accessibility' && (
            <>
              <div className="organisation-profile-heading">
                <h2>Accessibility</h2>
                <p>Adjust how this profile is displayed.</p>
              </div>
              <Select
                label="Text size"
                value={preferences.textSize}
                onChange={(event) =>
                  updatePreference(
                    'textSize',
                    event.target.value as ProfilePreferences['textSize'],
                  )
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
              <div className="organisation-profile-heading">
                <h2>Language</h2>
                <p>Display language for this workspace.</p>
              </div>
              <Select
                label="Display language"
                value={preferences.language}
                onChange={(event) =>
                  updatePreference(
                    'language',
                    event.target.value as ProfilePreferences['language'],
                  )
                }
              >
                <option value="en">English</option>
              </Select>
            </>
          )}
          {section === 'help' && (
            <>
              <div className="organisation-profile-heading">
                <h2>Help & Support</h2>
                <p>Guidance for your organisation workspace.</p>
              </div>
              <DisclosureRow label="Using Organisation Admin">
                <p>
                  Manage organisation details, members, site access and
                  workspace settings in their dedicated sections.
                </p>
              </DisclosureRow>
              <DisclosureRow label="Contact support">
                <p>
                  Contact your organisation’s internal support team for account
                  or workspace help. For immediate danger, follow site emergency
                  procedures first.
                </p>
              </DisclosureRow>
            </>
          )}
          <p
            role="status"
            aria-live="polite"
            className="organisation-profile-message"
          >
            {message}
          </p>
        </ProfileCard>
      </div>
    </div>
  );
}
