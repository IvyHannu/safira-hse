/** Isolated local organisation-governance fixture; not an access-control source. */
export const organisationOverview = {
  name: 'Riverside Group',
  status: 'Active',
  activeUsers: 48,
  activeSites: 5,
  pendingInvitations: 3,
  accessIssues: 2,
  hseAdmins: 4,
  updatedAt: '2026-09-24',
  attention: [
    {
      id: 'site-admin',
      title: 'Site without an assigned HSE admin',
      detail: 'Riverside Warehouse',
      tone: 'critical',
    },
    {
      id: 'invites',
      title: 'Invitations awaiting acceptance',
      detail: '3 people have not joined yet',
      tone: 'warning',
    },
    {
      id: 'access',
      title: 'Site access needs review',
      detail: '2 access requests require a decision',
      tone: 'warning',
    },
    {
      id: 'defaults',
      title: 'Organisation defaults updated',
      detail: 'Review the current site settings',
      tone: 'information',
    },
  ],
  activity: [
    {
      id: 'a1',
      action: 'Invitation sent',
      detail: 'New worker invited to Riverside Logistics',
      when: '2 hours ago',
    },
    {
      id: 'a2',
      action: 'Site details updated',
      detail: 'Riverside Refinery contact information',
      when: 'Yesterday',
    },
    {
      id: 'a3',
      action: 'Site access changed',
      detail: 'HSE site assignment updated',
      when: '2 days ago',
    },
    {
      id: 'a4',
      action: 'Organisation settings updated',
      detail: 'Default language confirmed',
      when: '3 days ago',
    },
  ],
} as const;
