import { organisationOverview } from './organisation-overview';

/** Local organisation-governance fixture. This is not an access-control source. */
export interface OrganisationSettingsData {
  name: string;
  logo: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  language: string;
  timezone: string;
  notifyInvitations: boolean;
  notifyAccessRequests: boolean;
  weeklySummary: boolean;
  requireSiteSelection: boolean;
  showMemberEmail: boolean;
  reducedMotion: boolean;
  largerText: boolean;
  showOrganisationLogo: boolean;
}

export const initialOrganisationSettings: OrganisationSettingsData = {
  name: organisationOverview.name,
  logo: '',
  industry: 'Logistics and industrial operations',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  language: 'English',
  timezone: 'UTC',
  notifyInvitations: true,
  notifyAccessRequests: true,
  weeklySummary: false,
  requireSiteSelection: true,
  showMemberEmail: false,
  reducedMotion: false,
  largerText: false,
  showOrganisationLogo: true,
};
