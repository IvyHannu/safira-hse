import type { ReactNode } from 'react';
import { OrganisationShell } from '@/components/organisation-admin/OrganisationShell';
import './organisation.css';

export default function OrganisationAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OrganisationShell>{children}</OrganisationShell>;
}
