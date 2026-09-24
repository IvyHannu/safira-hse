import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Button, EmptyState } from '@/components/ui';
import { useReporting } from '@/reporting/provider';

/**
 * Legacy route: redirects to the detail screen in /reports/[ref].
 * Kept so any in-flight navigation links remain valid.
 */
export default function SubmittedReportRedirectScreen() {
  const router = useRouter();
  const { state } = useReporting();
  const report = state.submitted;

  useEffect(() => {
    if (report) {
      router.replace(`/reports/${report.reference}`);
    }
  }, [report, router]);

  if (!report) {
    return (
      <EmptyState
        title="No report to view"
        description="Submitted demo reports appear here after you finish the flow."
        action={
          <Button label="Back Home" onPress={() => router.replace('/')} />
        }
      />
    );
  }

  return null;
}
