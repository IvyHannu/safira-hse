import { colors, spacing, typography } from '@safira/design-tokens';
import type { ReportStatus } from '@safira/types';
import { StyleSheet, Text, View } from 'react-native';
import type { DemoStatusStep } from '@/reporting/model';

const statusTone: Record<ReportStatus, string> = {
  submitted: colors.information,
  under_review: colors.information,
  action_required: colors.warning,
  resolved: colors.success,
  closed: colors.success,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ReportStatusTimelineItem({
  step,
  isLast,
}: {
  step: DemoStatusStep;
  isLast: boolean;
}) {
  const activeColor = statusTone[step.status];
  return (
    <View style={styles.row}>
      <View style={styles.indicatorColumn} accessibilityElementsHidden>
        <View
          style={[styles.dot, isLast && { backgroundColor: activeColor }]}
        />
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, isLast && { color: activeColor }]}>
          {step.label}
        </Text>
        <Text style={styles.meta}>{formatDate(step.timestamp)}</Text>
      </View>
    </View>
  );
}

export function ReportStatusTimeline({
  steps,
}: {
  steps: readonly DemoStatusStep[];
}) {
  return (
    <View>
      {steps.map((step, index) => (
        <ReportStatusTimelineItem
          key={`${step.status}-${step.timestamp}`}
          step={step}
          isLast={index === steps.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing[2] },
  indicatorColumn: { alignItems: 'center', width: 16 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.graphite,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 2,
    marginVertical: 2,
    backgroundColor: colors.graphite,
    opacity: 0.25,
  },
  content: { flex: 1, gap: 2, paddingBottom: spacing[2] },
  label: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
});
