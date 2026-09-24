import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import type { ReportStatus } from '@safira/types';
import { StyleSheet, Text, View } from 'react-native';
import {
  AppCard,
  Button,
  EmptyState,
  InlineAlert,
  SectionHeader,
  StatusBadge,
  type Tone,
} from '@/components/ui';
import { workerHomeDemo, workerReportCategories } from '@/demo/worker-data';
import { useAuth } from '@/lib/demo-auth';
import { isDraftStarted } from '@/reporting/model';
import { useReporting } from '@/reporting/provider';

const workerStatus: Record<ReportStatus, { label: string; tone: Tone }> = {
  submitted: { label: 'Sent', tone: 'information' },
  under_review: { label: 'Being reviewed', tone: 'information' },
  action_required: { label: 'More information needed', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'success' },
};

export default function HomeScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const { state } = useReporting();

  if (loading)
    return <Text style={styles.body}>Loading your demo session…</Text>;
  if (session?.role !== 'worker') {
    return (
      <View style={styles.content}>
        <SectionHeader
          title="Worker home"
          description="Choose the Worker demo role to see the prototype."
        />
        <EmptyState
          title="Worker access is ready"
          description="Open Profile and select Worker. This is local demo access only."
          action={
            <Button
              label="Open Profile"
              onPress={() => router.push('/profile')}
            />
          }
        />
      </View>
    );
  }

  const { worker, site, latestReport, assignedChecklist, activeSafetyAlert } =
    workerHomeDemo;
  const status = workerStatus[latestReport.status];
  const submitted = state.submitted;
  const submittedCategory = workerReportCategories.find(
    (category) => category.value === submitted?.content.category,
  );

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.greeting}>Hello, {worker.firstName}</Text>
        <Text style={styles.siteLabel}>CURRENT SITE</Text>
        <Text style={styles.siteName}>{site.name}</Text>
        <Text style={styles.body}>{site.area}</Text>
      </View>

      <View style={styles.actionArea}>
        <Text style={styles.actionTitle}>
          See something that needs attention?
        </Text>
        <Button
          label="Report something"
          onPress={() => router.push('/report')}
        />
      </View>

      {isDraftStarted(state.draft) && (
        <InlineAlert
          tone="information"
          title="Report in progress"
          message="Your draft is saved on this device. Choose Report something to continue."
        />
      )}

      {activeSafetyAlert && (
        <InlineAlert
          tone="warning"
          title={activeSafetyAlert.title}
          message={activeSafetyAlert.message}
        />
      )}

      <View style={styles.section}>
        <SectionHeader title="Your latest report" />
        <AppCard>
          {submitted ? (
            <>
              <Text style={styles.cardTitle}>
                {submittedCategory?.label ?? 'Your report'}
              </Text>
              <Text style={styles.meta}>
                {submitted.reference} · Submitted{' '}
                {new Date(submitted.submittedAt).toLocaleString()}
              </Text>
              <StatusBadge label="Submitted" tone="information" />
              <Button
                label="View report"
                variant="tertiary"
                onPress={() => router.push('/report/view')}
              />
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>{latestReport.title}</Text>
              <Text style={styles.meta}>
                {latestReport.reference} · {latestReport.updatedLabel}
              </Text>
              <StatusBadge label={status.label} tone={status.tone} />
            </>
          )}
        </AppCard>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Your safety check" />
        <AppCard>
          <Text style={styles.cardTitle}>{assignedChecklist.title}</Text>
          <Text style={styles.meta}>{assignedChecklist.locationLabel}</Text>
          <StatusBadge label={assignedChecklist.dueLabel} tone="information" />
        </AppCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  heading: { gap: spacing[1] },
  greeting: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 28,
    fontWeight: '700',
  },
  siteLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  siteName: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  actionArea: {
    gap: spacing[2],
    padding: spacing[2],
    backgroundColor: colors.graphite,
  },
  actionTitle: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
  },
  section: { gap: spacing[1] },
  cardTitle: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
});
