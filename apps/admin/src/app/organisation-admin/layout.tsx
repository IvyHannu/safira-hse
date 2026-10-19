import type { ReactNode } from 'react';
import { OrganisationOnboardingGate } from '@/components/organisation-admin/OrganisationOnboardingGate';
import './organisation.css';

export default function OrganisationAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OrganisationOnboardingGate>{children}</OrganisationOnboardingGate>;
}
