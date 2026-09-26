import { useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import type { ReportStatus } from '@safira/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Files from 'phosphor-react-native/src/icons/Files';
import ListChecks from 'phosphor-react-native/src/icons/ListChecks';
import { Button, type Tone } from '@/components/ui';
import { WorkspaceSelector } from '@/components/workspace-selector';
import { workerHomeDemo, workerReportCategories } from '@/demo/worker-data';
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

function HomeNotice({
  tone,
  title,
  message,
}: {
  tone: Tone;
  title: string;
  message: string;
}) {
  const statusColor = colors[tone];

  return (
    <View
      accessibilityRole="alert"
      style={[styles.notice, { backgroundColor: `${statusColor}0D` }]}
    >
      <View
        accessibilityElementsHidden
        style={[
          styles.noticeIndicator,
          { backgroundColor: `${statusColor}1A` },
        ]}
      >
        <View style={[styles.noticeDot, { backgroundColor: statusColor }]} />
      </View>
      <View style={styles.noticeCopy}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeMessage}>{message}</Text>
      </View>
    </View>
  );
}

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
  if (session?.role !== 'worker') {
    return <WorkspaceSelector />;
  }

  const { worker, site, latestReport, assignedChecklist, activeSafetyAlert } =
    workerHomeDemo;
  const status = workerStatus[latestReport.status];
  const submitted = state.submitted;
  const submittedCategory = workerReportCategories.find(
    (category) => category.value === submitted?.content.category,
  );
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
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>Safira</Text>
        </View>
        <View style={styles.headerContext}>
          <View style={styles.siteContext}>
            <Text style={styles.headerSite}>{site.name}</Text>
            <Text style={styles.headerArea}>{site.area}</Text>
          </View>
          <View
            style={styles.avatar}
            accessibilityLabel={`${worker.firstName} profile`}
          >
            <Text style={styles.avatarText}>
              {worker.firstName.slice(0, 1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.main}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            A safer workplace starts with you.
          </Text>
          <Text style={styles.heroMessage}>See something? Report it.</Text>
          <Button
            label="Report something"
            onPress={() => router.push('/report')}
          />
        </View>

        {isDraftStarted(state.draft) && (
          <HomeNotice
            tone="information"
            title="Report in progress"
            message="Your draft is saved on this device. Choose Report something to continue."
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick access</Text>
          <View style={styles.quickAccess}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="My Reports"
              onPress={() =>
                router.push(submitted ? '/report/view' : '/reports')
              }
              style={({ pressed }) => [
                styles.quickTile,
                pressed && styles.quickTilePressed,
              ]}
            >
              <Files size={25} color={colors.deepCharcoal} />
              <Text style={styles.quickTitle}>My Reports</Text>
              <Text style={styles.quickDescription} numberOfLines={2}>
                {submitted
                  ? `${submitted.reference} · Submitted`
                  : `${latestReport.reference} · ${status.label}`}
              </Text>
              <Text style={styles.quickDetail} numberOfLines={2}>
                {submitted
                  ? (submittedCategory?.label ?? 'Your report')
                  : latestReport.title}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Safety Checks"
              onPress={() =>
                router.push(assigned ? `/safety/${assigned.id}` : '/safety')
              }
              style={({ pressed }) => [
                styles.quickTile,
                pressed && styles.quickTilePressed,
              ]}
            >
              <ListChecks size={25} color={colors.deepCharcoal} />
              <Text style={styles.quickTitle}>Safety Checks</Text>
              <Text style={styles.quickDescription} numberOfLines={2}>
                {checklistStatus}
              </Text>
              <Text style={styles.quickDetail} numberOfLines={2}>
                {assigned?.title ?? assignedChecklist.title}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.guidance}>
          <View style={styles.guidanceCopy}>
            <Text style={styles.guidanceTitle}>Keep our workplace safe</Text>
            <Text style={styles.guidanceMessage}>
              Your awareness helps prevent incidents and protects our people,
              our environment and our communities.
            </Text>
          </View>
          <View
            style={styles.illustrationSlot}
            accessibilityLabel="Workplace illustration slot"
          >
            <Text style={styles.illustrationSlotLabel}>
              Workplace illustration
            </Text>
          </View>
        </View>

        {activeSafetyAlert && (
          <HomeNotice
            tone="warning"
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
    backgroundColor: colors.white,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.deepCharcoal,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandName: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  headerContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  siteContext: { alignItems: 'flex-end' },
  headerSite: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  headerArea: {
    color: colors.coolConcrete,
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.graphite,
  },
  avatarText: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  main: { gap: spacing[3], padding: spacing[2] },
  hero: {
    gap: spacing[1],
    padding: spacing[2],
    borderRadius: 8,
    backgroundColor: colors.graphite,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 29,
    maxWidth: 275,
  },
  heroMessage: {
    color: colors.coolConcrete,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing[1],
  },
  section: { gap: spacing[1] },
  sectionTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: '700',
  },
  quickAccess: { flexDirection: 'row', gap: spacing[1] },
  quickTile: {
    flex: 1,
    minHeight: 124,
    gap: 4,
    padding: spacing[1],
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  quickTilePressed: { backgroundColor: colors.coolSurface },
  quickTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  quickDescription: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 16,
  },
  quickDetail: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 15,
  },
  guidance: {
    minHeight: 120,
    flexDirection: 'row',
    gap: spacing[1],
    padding: spacing[2],
    borderRadius: 8,
    backgroundColor: colors.coolSurface,
  },
  guidanceCopy: { flex: 1, gap: spacing[1] },
  guidanceTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: '700',
  },
  guidanceMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  notice: {
    gap: spacing[1],
    padding: spacing[2],
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeIndicator: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noticeCopy: {
    flex: 1,
    gap: spacing[1],
  },
  noticeTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  noticeMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
  },
  illustrationSlot: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.coolConcrete,
    backgroundColor: colors.white,
  },
  illustrationSlotLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    textAlign: 'center',
  },
});
