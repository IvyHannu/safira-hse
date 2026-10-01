import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import Check from 'phosphor-react-native/src/icons/Check';
import { StyleSheet, Text, View } from 'react-native';
import { AppCard, Button, EmptyState, StatusBadge } from '@/components/ui';
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
      <View style={styles.success}>
        <View style={styles.successIcon} accessibilityElementsHidden>
          <Check size={36} weight="bold" color={colors.success} />
        </View>
        <Text style={styles.title}>Report submitted</Text>
        <Text style={styles.body}>
          Thank you for speaking up. Your report has been received.
        </Text>
      </View>
      <AppCard>
        <Text style={styles.referenceLabel}>Report reference</Text>
        <Text style={styles.reference}>{report.reference}</Text>
        <StatusBadge label="Submitted" tone="information" />
        <Text style={styles.timestamp}>
          Submitted {new Date(report.submittedAt).toLocaleString()}
        </Text>
      </AppCard>
      <AppCard title="What happens next">
        <Text style={styles.body}>
          The HSE team can review your report and share worker-facing updates.
        </Text>
        <Text style={styles.body}>Track progress in My Reports.</Text>
      </AppCard>
      <Button
        label="View report"
        onPress={() => router.push(`/reports/${report.reference}`)}
      />
      <Button
        label="Back Home"
        variant="secondary"
        onPress={() => router.replace('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[2], paddingTop: spacing[2] },
  success: { alignItems: 'center', gap: 6, paddingBottom: 4 },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.success}1C`,
  },
  title: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  referenceLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  reference: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  timestamp: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
});
