import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  EmptyState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { ReportSummary } from '@/components/report-summary';
import { useReporting } from '@/reporting/provider';

export default function SubmittedReportScreen() {
  const router = useRouter();
  const { state } = useReporting();
  const report = state.submitted;

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

  return (
    <View style={styles.content}>
      <Button
        label="Back to confirmation"
        variant="tertiary"
        onPress={() => router.replace('/report/confirmation')}
      />
      <SectionHeader
        title={report.reference}
        description="Your submitted demo report"
      />
      <StatusBadge label="Submitted" tone="success" />
      <Text style={styles.body}>
        Submitted {new Date(report.submittedAt).toLocaleString()}
      </Text>
      <ReportSummary content={report.content} />
      <Button
        label="Back Home"
        variant="secondary"
        onPress={() => router.replace('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
});
