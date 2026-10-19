import { redirect } from 'next/navigation';
import { OfficerOnboardingFlow } from '../officer-onboarding-flow';

export default function HseOfficerOnboardingPreviewPage() {
  if (process.env.NODE_ENV !== 'development') redirect('/hse-officer/overview');
  return <OfficerOnboardingFlow preview />;
}
