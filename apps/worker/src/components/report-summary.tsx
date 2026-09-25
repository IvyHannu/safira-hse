import type { ReactNode } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { InfoRow } from '@/components/ui';
import { workerHomeDemo, workerReportCategories } from '@/demo/worker-data';
import type { QuestionAnswer, ReportContent } from '@/reporting/model';

interface ReportSummaryProps {
  content: ReportContent;
  onEvidenceError?(): void;
  edit: {
    category(): void;
    details(): void;
    evidence(): void;
    questions(): void;
  };
}

function answerLabel(answer: QuestionAnswer | null) {
  if (answer === 'yes') return 'Yes';
  if (answer === 'no') return 'No';
  if (answer === 'not_sure') return 'Not sure';
  return 'No answer';
}

function SummarySection({
  title,
  editLabel,
  onEdit,
  children,
}: {
  title: string;
  editLabel: string;
  onEdit(): void;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.headingText}>{title}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editLabel}
          onPress={onEdit}
          style={({ pressed }) => [styles.edit, pressed && styles.editPressed]}
        >
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

export function ReportSummary({
  content,
  onEvidenceError,
  edit,
}: ReportSummaryProps) {
  const category = workerReportCategories.find(
    (item) => item.value === content.category,
  );
  const area = workerHomeDemo.workAreas.find(
    (item) => item.id === content.workAreaId,
  );

  return (
    <View style={styles.summary}>
      <SummarySection
        title="Report type"
        editLabel="Edit report type"
        onEdit={edit.category}
      >
        <Text style={styles.primaryValue}>
          {category?.label || 'Not chosen'}
        </Text>
      </SummarySection>

      <SummarySection
        title="Details & location"
        editLabel="Edit details and location"
        onEdit={edit.details}
      >
        <Text style={styles.body}>
          {content.description || 'No description'}
        </Text>
        <Text style={styles.secondaryValue}>
          {workerHomeDemo.site.name} · {area?.name || 'No work area chosen'}
        </Text>
        {content.source?.type === 'checklist_submission' && (
          <Text style={styles.secondaryValue}>
            Identified during safety check: {content.source.checklistTitle}
            {content.source.itemPrompt ? ` · ${content.source.itemPrompt}` : ''}
          </Text>
        )}
      </SummarySection>

      <SummarySection
        title="Evidence"
        editLabel="Edit evidence"
        onEdit={edit.evidence}
      >
        {content.evidenceChoice === 'photo' && content.evidence ? (
          <View style={styles.evidenceRow}>
            <Image
              source={{ uri: content.evidence.uri }}
              style={styles.photo}
              accessibilityLabel="Report photo"
              onError={onEvidenceError}
            />
            <Text style={styles.body} numberOfLines={2}>
              {content.evidence.fileName}
            </Text>
          </View>
        ) : (
          <Text style={styles.body}>
            {content.evidenceChoice === 'skipped'
              ? 'Photo skipped'
              : 'No photo added'}
          </Text>
        )}
      </SummarySection>

      <SummarySection
        title="Additional answers"
        editLabel="Edit additional answers"
        onEdit={edit.questions}
      >
        <View style={styles.answers}>
          <InfoRow
            label="Anyone hurt?"
            value={answerLabel(content.answers.anyoneHurt)}
          />
          <InfoRow
            label="Anything damaged?"
            value={answerLabel(content.answers.anythingDamaged)}
          />
          <InfoRow
            label="Environmental impact?"
            value={answerLabel(content.answers.environmentalImpact)}
          />
        </View>
      </SummarySection>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    paddingHorizontal: spacing[2],
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: colors.coolConcrete,
    paddingVertical: spacing[1],
    gap: 4,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingText: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  edit: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPressed: { opacity: 0.65 },
  editText: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  primaryValue: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryValue: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  evidenceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  photo: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.coolSurface,
  },
  answers: { gap: 4 },
});
