'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Buildings, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ImageEditControl } from '@/components/ui/image-edit-control';
import { Input, Select, Textarea } from '@/components/ui/forms';
import { MetadataLabel } from '@/components/ui/report-metadata';
import { PreferenceToggle } from '@/components/ui/profile-settings';
import { PageHeader } from '@/components/ui/shell';
import { organisationOverview } from '@/data/organisation-overview';
import type { OrganisationSettingsData } from '@/data/organisation-settings';
import {
  saveOrganisationSettings,
  useOrganisationSettings,
} from './organisation-settings-store';
import './organisation-governance.css';

type Mode = 'organisation' | 'settings';

export function OrganisationGovernance({ mode }: { mode: Mode }) {
  const saved = useOrganisationSettings();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<OrganisationSettingsData>({ defaultValues: saved });
  const [message, setMessage] = useState('');
  const [logoError, setLogoError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const values = useWatch({ control });
  const logo = values.logo;

  useEffect(() => {
    reset(saved);
  }, [saved, reset]);

  function save(values: OrganisationSettingsData) {
    try {
      saveOrganisationSettings(values);
      reset(values);
      setMessage('Changes saved in this browser.');
    } catch {
      setMessage('Could not save changes in this browser. Please try again.');
    }
  }

  async function selectLogo(file?: File) {
    if (!file) return;
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 250_000
    ) {
      setLogoError('Choose a PNG, JPG or WebP image under 250 KB.');
      return;
    }
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setValue('logo', data, { shouldDirty: true });
      setLogoError('');
      setMessage('');
    } catch {
      setLogoError('Could not read the logo. Choose another image.');
    }
  }

  return (
    <div className="organisation-governance" data-mode={mode}>
      <PageHeader
        title={mode === 'organisation' ? 'Organisation' : 'Settings'}
        description={
          mode === 'organisation'
            ? 'Maintain organisation details and the primary contact.'
            : 'Set organisation defaults for language, notifications, privacy and accessibility.'
        }
      />
      <form onSubmit={handleSubmit(save)} noValidate>
        {mode === 'organisation' ? (
          <>
            <section className="organisation-governance-section safira-card-surface">
              <div className="organisation-governance-heading">
                <h2>Organisation profile</h2>
                <p>Identity and details shown to your organisation.</p>
              </div>
              <div className="organisation-logo-row">
                <ImageEditControl
                  imageLabel={
                    logo
                      ? 'Organisation logo preview'
                      : 'Organisation logo placeholder'
                  }
                  editLabel={
                    logo
                      ? 'Change organisation logo'
                      : 'Upload organisation logo'
                  }
                  onEdit={() => fileInput.current?.click()}
                >
                  {logo ? (
                    <span
                      className="size-full bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${logo})` }}
                    />
                  ) : (
                    <Buildings size={27} aria-hidden="true" />
                  )}
                </ImageEditControl>
                <div className="organisation-logo-actions">
                  <strong>Organisation logo</strong>
                  <small>
                    PNG, JPG or WebP, up to 250 KB. Safira branding remains
                    visible.
                  </small>
                  <div>
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      aria-label="Choose organisation logo"
                      onChange={(event) =>
                        void selectLogo(event.target.files?.[0])
                      }
                    />
                    {logo && (
                      <Button
                        variant="destructive-tertiary"
                        size="compact"
                        icon={<X size={16} />}
                        onClick={() => {
                          setValue('logo', '', { shouldDirty: true });
                          setLogoError('');
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {logoError && (
                    <small
                      role="alert"
                      className="organisation-governance-error"
                    >
                      {logoError}
                    </small>
                  )}
                </div>
              </div>
              <div className="organisation-governance-fields">
                <Input
                  label="Organisation name"
                  className="safira-control-compact"
                  {...register('name', {
                    required: 'Enter the organisation name.',
                  })}
                  error={errors.name?.message}
                />
                <Input
                  label="Industry"
                  className="safira-control-compact"
                  {...register('industry', { required: 'Enter the industry.' })}
                  error={errors.industry?.message}
                />
                <div className="organisation-governance-status">
                  <span>Organisation status</span>
                  <MetadataLabel
                    kind="status"
                    tone="success"
                    label={organisationOverview.status}
                  />
                  <small>Current organisation access status</small>
                </div>
              </div>
            </section>
            <section className="organisation-governance-section safira-card-surface">
              <div className="organisation-governance-heading">
                <h2>Contact details</h2>
                <p>Organisation-wide contact information.</p>
              </div>
              <div className="organisation-governance-fields">
                <Input
                  label="Primary contact name"
                  className="safira-control-compact"
                  {...register('contactName')}
                />
                <Input
                  label="Support email"
                  className="safira-control-compact"
                  type="email"
                  {...register('contactEmail', {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address.',
                    },
                  })}
                  error={errors.contactEmail?.message}
                />
                <Input
                  label="Contact phone"
                  className="safira-control-compact"
                  type="tel"
                  {...register('contactPhone')}
                />
                <Textarea
                  label="Organisation address"
                  rows={2}
                  {...register('address')}
                />
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="organisation-governance-section">
              <div className="organisation-governance-heading">
                <h2>General settings</h2>
                <p>Basic information about your organisation.</p>
              </div>
              <div className="organisation-governance-fields">
                <Select
                  label="Default language"
                  className="safira-control-compact"
                  {...register('language')}
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Spanish</option>
                </Select>
                <Select
                  label="Timezone"
                  className="safira-control-compact"
                  {...register('timezone')}
                >
                  <option value="UTC">UTC</option>
                  <option value="Africa/Lagos">Africa/Lagos</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Pacific/Auckland">Pacific/Auckland</option>
                </Select>
              </div>
            </section>
            <section className="organisation-governance-section">
              <div className="organisation-governance-heading">
                <h2>Notifications</h2>
                <p>Choose which organisation activity to highlight.</p>
              </div>
              <PreferenceToggle
                compact
                label="Invitation updates"
                description="Show updates about pending invitations."
                checked={!!values.notifyInvitations}
                onChange={(value) =>
                  setValue('notifyInvitations', value, { shouldDirty: true })
                }
              />
              <PreferenceToggle
                compact
                label="Access requests"
                description="Highlight requests for site and role access."
                checked={!!values.notifyAccessRequests}
                onChange={(value) =>
                  setValue('notifyAccessRequests', value, { shouldDirty: true })
                }
              />
              <PreferenceToggle
                compact
                label="Weekly summary"
                description="Prepare an organisation activity summary."
                checked={!!values.weeklySummary}
                onChange={(value) =>
                  setValue('weeklySummary', value, { shouldDirty: true })
                }
              />
            </section>
            <section className="organisation-governance-section">
              <div className="organisation-governance-heading">
                <h2>Privacy and access defaults</h2>
                <p>
                  Organisation preferences for new records and directory
                  visibility.
                </p>
              </div>
              <PreferenceToggle
                compact
                label="Require a site on new records"
                description="Default new organisation records to a selected site."
                checked={!!values.requireSiteSelection}
                onChange={(value) =>
                  setValue('requireSiteSelection', value, { shouldDirty: true })
                }
              />
              <PreferenceToggle
                compact
                label="Show member email in the directory"
                description="Allow organisation members to see member email addresses."
                checked={!!values.showMemberEmail}
                onChange={(value) =>
                  setValue('showMemberEmail', value, { shouldDirty: true })
                }
              />
            </section>
            <section className="organisation-governance-section">
              <div className="organisation-governance-heading">
                <h2>Accessibility and branding</h2>
                <p>Keep Safira controls, contrast and navigation consistent.</p>
              </div>
              <PreferenceToggle
                compact
                label="Reduced motion by default"
                description="Prefer less animation across the organisation workspace."
                checked={!!values.reducedMotion}
                onChange={(value) =>
                  setValue('reducedMotion', value, { shouldDirty: true })
                }
              />
              <PreferenceToggle
                compact
                label="Larger text by default"
                description="Prefer a larger text setting for organisation workspaces."
                checked={!!values.largerText}
                onChange={(value) =>
                  setValue('largerText', value, { shouldDirty: true })
                }
              />
              <PreferenceToggle
                compact
                label="Show organisation logo"
                description="Show the organisation logo alongside Safira identity where supported."
                checked={!!values.showOrganisationLogo}
                onChange={(value) =>
                  setValue('showOrganisationLogo', value, { shouldDirty: true })
                }
              />
            </section>
          </>
        )}
        <div className="organisation-governance-save">
          <span role="status">{message}</span>
          <Button type="submit" variant="primary" disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
