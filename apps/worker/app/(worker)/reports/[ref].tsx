import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import type { ReportStatus } from '@safira/types';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  AppCard,
  Button,
  EmptyState,
  SectionHeader,
  StatusBadge,
  WorkerHeader,
  type Tone,
} from '@/components/ui';
import type { DemoReport, DemoStatusStep } from '@/reporting/model';
import { useReporting } from '@/reporting/provider';

const STATUS_CONFIG: Record<ReportStatus, { label: string; tone: Tone }> = {
  submitted: { label: 'Submitted', tone: 'information' },
  under_review: { label: 'Under review', tone: 'information' },
  action_required: { label: 'More info needed', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'success' },
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  hazard: 'Hazard',
  near_miss: 'Near miss',
  incident: 'Incident',
  environmental_concern: 'Environmental concern',
};

const ANSWER_LABELS: Record<string, string> = {
  yes: 'Yes',
  no: 'No',
  not_sure: 'Not sure',
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

function StatusTimeline({ steps }: { steps: readonly DemoStatusStep[] }) {
  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => {
        const { tone } = STATUS_CONFIG[step.status];
        const isLast = index === steps.length - 1;
        return (
          <View key={step.status + step.timestamp} style={styles.timelineRow}>
            {/* Connector line */}
            <View style={styles.timelineIndicatorCol}>
              <View
                style={[
                  styles.timelineDot,
                  isLast && { backgroundColor: colors[tone] },
                ]}
              />
              {!isLast && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
              <Text
                style={[
                  styles.timelineLabel,
                  isLast && { color: colors[tone] },
                ]}
              >
                {step.label}
              </Text>
              <Text style={styles.timelineMeta}>
                {formatDate(step.timestamp)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ReportDetailContent({ report }: { report: DemoReport }) {
  const router = useRouter();
  const { label, tone } = STATUS_CONFIG[report.status];
  const locationParts = [report.site, report.workArea].filter(Boolean);
  const isResolved = report.status === 'resolved' || report.status === 'closed';

  return (
    <View style={styles.content}>
      <WorkerHeader
        backLabel="Back to My Reports"
        onBack={() => router.replace('/reports')}
        context={report.site}
      />

      <View style={styles.header}>
        <Text style={styles.reference}>{report.reference}</Text>
        <StatusBadge label={label} tone={tone} />
        <Text style={styles.headerMeta}>{report.categoryLabel}</Text>
        <Text style={styles.headerMeta}>{locationParts.join(' · ')}</Text>
        <Text style={styles.headerMeta}>
          Submitted {formatDate(report.submittedAt)}
        </Text>
        {report.source?.type === 'checklist_submission' ? (
          <Text style={styles.headerMeta}>
            Origin: Safety check ({report.source.checklistTitle})
          </Text>
        ) : null}
        {report.classification ? (
          <Text style={styles.classification}>
            HSE classification:{' '}
            {CLASSIFICATION_LABELS[report.classification] ??
              report.classification}
          </Text>
        ) : null}
      </View>

      {/* Evidence */}
      {report.evidenceUri ? (
        <View style={styles.section}>
          <SectionHeader title="Photo evidence" />
          <AppCard>
            <Image
              source={{ uri: report.evidenceUri }}
              style={styles.photo}
              accessibilityLabel="Report photo"
            />
            {report.evidenceFileName ? (
              <Text style={styles.body}>{report.evidenceFileName}</Text>
            ) : null}
          </AppCard>
        </View>
      ) : null}

      {/* Description */}
      <View style={styles.section}>
        <SectionHeader title="What you reported" />
        <AppCard>
          <Text style={styles.body}>{report.description}</Text>
        </AppCard>
      </View>

      {/* Answers */}
      {report.answers ? (
        <View style={styles.section}>
          <SectionHeader title="Your answers" />
          <AppCard>
            <View style={styles.answerRow}>
              <Text style={styles.answerQuestion}>Was anyone hurt?</Text>
              <Text style={styles.answerValue}>
                {ANSWER_LABELS[report.answers.anyoneHurt ?? ''] ?? '—'}
              </Text>
            </View>
            <View style={styles.answerRow}>
              <Text style={styles.answerQuestion}>Was anything damaged?</Text>
              <Text style={styles.answerValue}>
                {ANSWER_LABELS[report.answers.anythingDamaged ?? ''] ?? '—'}
              </Text>
            </View>
            <View style={styles.answerRow}>
              <Text style={styles.answerQuestion}>
                Could the environment be affected?
              </Text>
              <Text style={styles.answerValue}>
                {ANSWER_LABELS[report.answers.environmentalImpact ?? ''] ?? '—'}
              </Text>
            </View>
          </AppCard>
        </View>
      ) : null}

      {/* Status timeline */}
      <View style={styles.section}>
        <SectionHeader title="Status timeline" />
        <AppCard>
          <StatusTimeline steps={report.timeline} />
        </AppCard>
      </View>

      {/* Worker-facing updates */}
      {report.updates.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader
            title="Updates from HSE"
            description="Messages the safety team has shared with you."
          />
          {report.updates.map((update) => (
            <AppCard key={update.id}>
              <Text style={styles.body}>{update.body}</Text>
              <Text style={styles.updateMeta}>
                {formatDate(update.postedAt)}
              </Text>
            </AppCard>
          ))}
        </View>
      ) : null}

      {/* Resolution summary — only shown when resolved */}
      {isResolved && report.resolution ? (
        <View style={styles.section}>
          <SectionHeader
            title="Resolution"
            description="How this report was closed."
          />
          <AppCard>
            <Text style={styles.body}>{report.resolution.summary}</Text>
            <Text style={styles.updateMeta}>
              Resolved {formatDate(report.resolution.resolvedAt)}
            </Text>
          </AppCard>
        </View>
      ) : null}
    </View>
  );
}

export default function ReportDetailScreen() {
  const router = useRouter();
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const { getReport } = useReporting();
  const report = ref ? getReport(ref) : null;

  if (!report) {
    return (
      <View style={styles.content}>
        <EmptyState
          title="Report not found"
          description="This report could not be found."
          action={
            <Button
              label="Back to My Reports"
              onPress={() => router.replace('/reports')}
            />
          }
        />
      </View>
    );
  }

  return <ReportDetailContent report={report} />;
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  header: { gap: spacing[1] },
  section: { gap: spacing[1] },
  reference: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 28,
    fontWeight: '700',
  },
  headerMeta: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  classification: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  updateMeta: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.coolSurface,
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[1],
  },
  answerQuestion: {
    flex: 1,
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  answerValue: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  timeline: { gap: 0 },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.graphite,
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.graphite,
    opacity: 0.25,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing[2],
    gap: 2,
  },
  timelineLabel: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  timelineMeta: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
});
