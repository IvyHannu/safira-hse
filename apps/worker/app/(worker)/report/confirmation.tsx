import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';
import {
  AppCard,
  Button,
  EmptyState,
  SectionHeader,
  StatusBadge,
} from '@/components/ui';
import { useReporting } from '@/reporting/provider';

export default function ReportConfirmationScreen() {
  const router = useRouter();
  const { state } = useReporting();
  const report = state.submitted;

  if (!report) {
    return (
      <EmptyState
        title="No submitted demo report"
        description="Start from Home to create a local report."
        action={
          <Button label="Back Home" onPress={() => router.replace('/')} />
        }
      />
    );
  }

  return (
    <View style={styles.content}>
      <SectionHeader
        title="Report submitted"
        description="Your demo report was saved on this device."
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
        <Text style={styles.body}>
          This demo has not sent anything to your organisation.
        </Text>
      </AppCard>
      <Button label="View report" onPress={() => router.push('/report/view')} />
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
  reference: {
    color: colors.softBlack,
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
