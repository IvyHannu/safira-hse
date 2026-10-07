import type { ReactNode } from 'react';
import { AdminShell } from '@/components/hse-admin/AdminShell';
import './admin.css';
export default function HseAdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
