import { useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import type { ReportStatus } from '@safira/types';
import { StyleSheet, Text, View } from 'react-native';
import Files from 'phosphor-react-native/src/icons/Files';
import ListChecks from 'phosphor-react-native/src/icons/ListChecks';
import {
  DraftStatusCard,
  GuidanceCard,
  HeroActionCard,
  NoticeCard,
  QuickAccessCard,
  type Tone,
  WorkerHomeHeader,
} from '@/components/ui';
import { WorkspaceSelector } from '@/components/workspace-selector';
import { workerHomeDemo } from '@/demo/worker-data';
import { useAuth } from '@/lib/demo-auth';
import { isDraftStarted } from '@/reporting/model';
import { useReporting } from '@/reporting/provider';
import { useSafety } from '@/safety/provider';

const workerStatus: Record<ReportStatus, { label: string; tone: Tone }> = {
  submitted: { label: 'Sent', tone: 'information' },
  under_review: { label: 'Being reviewed', tone: 'information' },
  action_required: { label: 'More information needed', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'success' },
};

export default function HomeScreen() {
  const router = useRouter();
  const { workspaceRole } = useLocalSearchParams<{ workspaceRole?: string }>();
  const { session, loading, signIn } = useAuth();
  const linkHandled = useRef(false);
  const { state } = useReporting();

  useEffect(() => {
    if (loading || workspaceRole !== 'worker' || linkHandled.current) return;
    linkHandled.current = true;
    void signIn('worker').then((saved) => {
      if (saved) router.replace('/');
    });
  }, [workspaceRole, loading, router, signIn]);
  const { checklists } = useSafety();

  if (loading) return <Text style={styles.body}>Opening Safira…</Text>;
  if (session?.role !== 'worker') return <WorkspaceSelector />;

  const { worker, site, assignedChecklist, activeSafetyAlert } = workerHomeDemo;
  const latestReport = [...state.demoReports].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )[0];
  const status = latestReport ? workerStatus[latestReport.status] : null;
  const assigned = checklists.find((c) => c.assignedToWorker) ?? checklists[0];
  const isDone = assigned?.status === 'completed';
  const isInProgress = assigned?.status === 'in_progress';
  const checklistStatus = isDone
    ? 'Completed'
    : isInProgress
      ? 'In progress'
      : (assigned?.dueLabel ?? assignedChecklist.dueLabel);

  return (
    <View style={styles.content}>
      <WorkerHomeHeader
        siteName={site.name}
        area={site.area}
        firstName={worker.firstName}
        photoUri={worker.photoUri}
      />
      <View style={styles.main}>
        <HeroActionCard onReport={() => router.push('/report')} />

        {isDraftStarted(state.draft) && (
          <DraftStatusCard onContinue={() => router.push('/report')} />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick access</Text>
          <View style={styles.quickAccess}>
            <QuickAccessCard
              label="My Reports"
              icon={<Files size={22} color={colors.deepCharcoal} />}
              description={
                latestReport
                  ? `${latestReport.reference} · ${status?.label}`
                  : 'No reports yet'
              }
              detail={latestReport?.categoryLabel ?? 'View your report history'}
              onPress={() =>
                router.push(
                  latestReport
                    ? `/reports/${latestReport.reference}`
                    : '/reports',
                )
              }
            />
            <QuickAccessCard
              label="Safety Checks"
              icon={<ListChecks size={22} color={colors.deepCharcoal} />}
              description={checklistStatus}
              detail={assigned?.title ?? assignedChecklist.title}
              onPress={() =>
                router.push(assigned ? `/safety/${assigned.id}` : '/safety')
              }
            />
          </View>
        </View>

        <GuidanceCard />

        {activeSafetyAlert && (
          <NoticeCard
            title={activeSafetyAlert.title}
            message={activeSafetyAlert.message}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    marginHorizontal: -spacing[2],
    marginTop: -spacing[2],
    backgroundColor: colors.coolSurface,
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  main: { gap: spacing[2], padding: spacing[2] },
  section: { gap: spacing[1] },
  sectionTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: '700',
  },
  quickAccess: { flexDirection: 'row', gap: spacing[1] },
});
