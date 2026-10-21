import { redirect } from 'next/navigation';
import { OrganisationAdminOnboardingFlow } from '../organisation-admin-onboarding-flow';

export default function OrganisationAdminOnboardingPreviewPage() {
  if (process.env.NODE_ENV !== 'development')
    redirect('/organisation-admin/overview');
  return <OrganisationAdminOnboardingFlow preview />;
}
