import type { AuthRole } from '@safira/auth';

/** Isolated local governance records; these never grant application access. */
export type MemberStatus = 'active' | 'inactive' | 'invited';
export interface OrganisationMember {
  id: string;
  name: string;
  email: string;
  roles: AuthRole[];
  sites: string[];
  status: MemberStatus;
  lastActive: string;
}

export const roleLabels: Record<AuthRole, string> = {
  worker: 'Worker',
  hse_officer: 'HSE Officer',
  hse_admin: 'HSE Admin',
  organisation_admin: 'Organisation Admin',
};

export const initialOrganisationMembers: OrganisationMember[] = [
  {
    id: '65c614e4-b639-457e-a7fd-19e8d03a2b41',
    name: 'Aiman Hashim',
    email: 'aiman.hashim@example.com',
    roles: ['organisation_admin'],
    sites: [],
    status: 'active',
    lastActive: 'Today',
  },
  {
    id: '1d9066f3-7b76-43d9-906e-20f53b7ef1ea',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    roles: ['hse_officer'],
    sites: ['Riverside Logistics', 'Riverside Warehouse', 'Riverside Refinery'],
    status: 'active',
    lastActive: 'Today',
  },
  {
    id: '3a48dfca-0900-4c6c-bd8d-d430cd68ec39',
    name: 'Lisa Wong',
    email: 'lisa.wong@example.com',
    roles: ['hse_admin'],
    sites: ['Riverside Refinery', 'Harbor Yard'],
    status: 'active',
    lastActive: 'Yesterday',
  },
  {
    id: '6d473adb-970a-4a87-bc86-0ce81ec5f635',
    name: 'James Park',
    email: 'james.park@example.com',
    roles: ['hse_officer'],
    sites: ['North Construction Site'],
    status: 'active',
    lastActive: '2 days ago',
  },
  {
    id: '599cf5a8-c640-4361-a4f1-d363f310a46d',
    name: 'Amara Smith',
    email: 'amara.smith@example.com',
    roles: ['worker'],
    sites: ['Riverside Logistics'],
    status: 'active',
    lastActive: 'Today',
  },
  {
    id: '9bbc7180-900e-42fb-9eb0-527efbcdd5ea',
    name: 'Daniel Koro',
    email: 'daniel.koro@example.com',
    roles: ['worker'],
    sites: ['Harbor Yard'],
    status: 'inactive',
    lastActive: '12 days ago',
  },
  {
    id: '64089744-3e9b-47b5-8c5d-1d6579121d89',
    name: 'Mika Kareem',
    email: 'mika.kareem@example.com',
    roles: ['worker'],
    sites: ['North Construction Site'],
    status: 'invited',
    lastActive: 'Not yet active',
  },
];
