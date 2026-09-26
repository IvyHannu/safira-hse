import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';
import {
  AppCard,
  Button,
  EmptyState,
  SectionHeader,
  StatusBadge,
  WorkerHeader,
} from '@/components/ui';
import { workerHomeDemo } from '@/demo/worker-data';
import { useReporting } from '@/reporting/provider';

export default function ReportConfirmationScreen() {
  const router = useRouter();
  const { state } = useReporting();
  const report = state.submitted;

  if (!report) {
    return (
      <EmptyState
        title="No submitted report"
        description="Start from Home to create a local report."
        action={
          <Button label="Back Home" onPress={() => router.replace('/')} />
        }
      />
    );
  }

  return (
    <View style={styles.content}>
      <WorkerHeader
        backLabel="Back Home"
        onBack={() => router.replace('/')}
        context={workerHomeDemo.site.name}
      />
      <SectionHeader
        title="Report submitted"
        description="Your report has been saved."
      />
      <AppCard>
        <Text style={styles.reference}>{report.reference}</Text>
        <StatusBadge label="Submitted" tone="success" />
        <Text style={styles.body}>
          Submitted {new Date(report.submittedAt).toLocaleString()}
        </Text>
      </AppCard>
      <AppCard title="What happens next">
        <Text style={styles.body}>
          In a connected Safira app, the safety team would review your report
          and share updates here.
        </Text>
        <Text style={styles.body}>Your report is available in My Reports.</Text>
      </AppCard>
      <Button
        label="View report"
        onPress={() => router.push(`/reports/${report.reference}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  reference: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
});
