import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';
import { Button, InlineAlert, WorkerHeader } from '@/components/ui';
import { ReportSummary } from '@/components/report-summary';
import { workerHomeDemo } from '@/demo/worker-data';
import { reviewIssues } from '@/reporting/model';
import { useReporting } from '@/reporting/provider';

export default function ReviewReportScreen() {
  const router = useRouter();
  const { state, submit } = useReporting();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photoUnavailable, setPhotoUnavailable] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const issues = reviewIssues(state.draft);

  function submitReport() {
    setAttemptedSubmit(true);
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
      <WorkerHeader
        backLabel="Back to questions"
        onBack={() => router.replace('/report/questions')}
        context={workerHomeDemo.site.name}
      />
      <View style={styles.progress} accessibilityLabel="Review and submit step">
        <View style={[styles.progressSegment, styles.progressActive]} />
        <View style={[styles.progressSegment, styles.progressActive]} />
        <View style={[styles.progressSegment, styles.progressActive]} />
      </View>
      <View style={styles.intro}>
        <Text style={styles.title}>Review your report</Text>
        <Text style={styles.guidance}>
          Check the details below before submitting.
        </Text>
      </View>
      <ReportSummary
        content={state.draft}
        onEvidenceError={() => setPhotoUnavailable(true)}
        edit={{
          category: () => router.push('/report'),
          details: () => router.push('/report/details'),
          evidence: () => router.push('/report/evidence'),
          questions: () => router.push('/report/questions'),
        }}
      />
      <Text style={styles.note}>
        The HSE team may confirm or update the classification and severity after
        reviewing your report.
      </Text>
      {attemptedSubmit && issues.length > 0 && (
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
          message="Edit evidence to choose another local photo or Skip before submitting."
        />
      )}
      {submitError && (
        <InlineAlert
          tone="critical"
          title="Not submitted"
          message={submitError}
        />
      )}
      <View style={styles.footer}>
        <View style={styles.footerSubmit}>
          <Button
            label="Submit Report"
            disabled={photoUnavailable}
            onPress={submitReport}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[2] },
  progress: { flexDirection: 'row', gap: 4 },
  progressSegment: { flex: 1, height: 4, backgroundColor: colors.coolConcrete },
  progressActive: { backgroundColor: colors.signalYellow },
  intro: { gap: 4 },
  title: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  guidance: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: { flexDirection: 'row', gap: spacing[1] },
  footerSubmit: { flex: 2 },
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
