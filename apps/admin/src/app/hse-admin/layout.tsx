import type { ReactNode } from 'react';
import { HseAdminOnboardingGate } from '@/components/hse-admin/HseAdminOnboardingGate';
import './admin.css';
export default function HseAdminLayout({ children }: { children: ReactNode }) {
  return <HseAdminOnboardingGate>{children}</HseAdminOnboardingGate>;
}
