import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';
import { Button, InlineAlert, SectionHeader } from '@/components/ui';
import { ReportSummary } from '@/components/report-summary';
import { reviewIssues } from '@/reporting/model';
import { useReporting } from '@/reporting/provider';

export default function ReviewReportScreen() {
  const router = useRouter();
  const { state, submit } = useReporting();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photoUnavailable, setPhotoUnavailable] = useState(false);
  const issues = reviewIssues(state.draft);

  function submitReport() {
    setSubmitError(null);
    if (issues.length > 0 || photoUnavailable) return;
    const report = submit();
    if (report) router.replace('/report/confirmation');
    else
      setSubmitError(
        'The report could not be saved as submitted. Your draft is still available.',
      );
  }

  return (
    <View style={styles.content}>
      <Button
        label="Back to questions"
        variant="tertiary"
        onPress={() => router.replace('/report/questions')}
      />
      <SectionHeader
        title="Review your report"
        description="Check your answers before submitting."
      />
      <ReportSummary
        content={state.draft}
        onEvidenceError={() => setPhotoUnavailable(true)}
        edit={{
          category: () => router.push('/report'),
          details: () => router.push('/report/details'),
          questions: () => router.push('/report/questions'),
        }}
      />
      <InlineAlert
        tone="information"
        title="What happens next"
        message="The HSE team may update the formal classification and severity after reviewing your report. You do not need to decide those now."
      />
      {issues.length > 0 && (
        <View style={styles.issues} accessibilityRole="alert">
          <Text style={styles.issueTitle}>
            Please finish these before submitting:
          </Text>
          {issues.map((issue) => (
            <Text key={issue} style={styles.issue}>
              • {issue}
            </Text>
          ))}
        </View>
      )}
      {photoUnavailable && (
        <InlineAlert
          tone="warning"
          title="Photo unavailable"
          message="Edit details to choose another local photo or Skip before submitting."
        />
      )}
      {submitError && (
        <InlineAlert
          tone="critical"
          title="Not submitted"
          message={submitError}
        />
      )}
      <Button
        label="Submit Report"
        disabled={issues.length > 0 || photoUnavailable}
        onPress={submitReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  issues: { gap: spacing[1] },
  issueTitle: {
    color: colors.critical,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  issue: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
});
