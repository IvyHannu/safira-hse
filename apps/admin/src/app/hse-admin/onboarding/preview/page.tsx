import { redirect } from 'next/navigation';
import { HseAdminOnboardingFlow } from '../hse-admin-onboarding-flow';

export default function HseAdminOnboardingPreviewPage() {
  if (process.env.NODE_ENV !== 'development') redirect('/hse-admin/overview');
  return <HseAdminOnboardingFlow preview />;
}
