import { notFound } from 'next/navigation';
import { reportData } from '@/data/reports';
import { ReportManagement } from '@/components/hse-admin/ReportManagement';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = Object.prototype.hasOwnProperty.call(reportData, id)
    ? reportData[id]
    : undefined;
  if (!report) notFound();
  return <ReportManagement key={id} initialReport={report} />;
}
