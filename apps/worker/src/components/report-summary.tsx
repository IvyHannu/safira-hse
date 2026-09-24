import { colors, radius, spacing, typography } from '@safira/design-tokens';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AppCard, Button, SectionHeader } from '@/components/ui';
import { workerHomeDemo, workerReportCategories } from '@/demo/worker-data';
import type { QuestionAnswer, ReportContent } from '@/reporting/model';

interface ReportSummaryProps {
  content: ReportContent;
  onEvidenceError?(): void;
  edit?: {
    category(): void;
    details(): void;
    questions(): void;
  };
}

function answerLabel(answer: QuestionAnswer | null) {
  if (answer === 'yes') return 'Yes';
  if (answer === 'no') return 'No';
  if (answer === 'not_sure') return 'Not sure';
  return 'No answer';
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
    <View style={styles.content}>
      <View style={styles.section}>
        <SectionHeader title="What you noticed" />
        <AppCard>
          <Text style={styles.value}>{category?.label || 'Not chosen'}</Text>
          {edit && (
            <Button
              label="Edit category"
              variant="tertiary"
              onPress={edit.category}
            />
          )}
        </AppCard>
      </View>

      {content.source?.type === 'checklist_submission' && (
        <View style={styles.section}>
          <SectionHeader title="Source" />
          <AppCard>
            <Text style={styles.label}>Origin</Text>
            <Text style={styles.body}>
              Identified during safety check: {content.source.checklistTitle}
            </Text>
            {content.source.itemPrompt ? (
              <>
                <Text style={styles.label}>Check item</Text>
                <Text style={styles.body}>{content.source.itemPrompt}</Text>
              </>
            ) : null}
          </AppCard>
        </View>
      )}

      <View style={styles.section}>
        <SectionHeader title="Evidence & details" />
        <AppCard>
          {content.evidenceChoice === 'photo' && content.evidence ? (
            <View style={styles.section}>
              <Image
                source={{ uri: content.evidence.uri }}
                style={styles.photo}
                accessibilityLabel="Report photo"
                onError={onEvidenceError}
              />
              <Text style={styles.body}>{content.evidence.fileName}</Text>
            </View>
          ) : content.evidenceChoice === 'skipped' ? (
            <Text style={styles.body}>Photo skipped</Text>
          ) : (
            <Text style={styles.body}>No photo added</Text>
          )}
          <Text style={styles.label}>Description</Text>
          <Text style={styles.body}>
            {content.description || 'No description'}
          </Text>
          <Text style={styles.label}>Site and work area</Text>
          <Text style={styles.body}>
            {workerHomeDemo.site.name} · {area?.name || 'No work area chosen'}
          </Text>
          {edit && (
            <Button
              label="Edit details"
              variant="tertiary"
              onPress={edit.details}
            />
          )}
        </AppCard>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Your answers" />
        <AppCard>
          <Text style={styles.body}>
            Anyone hurt? {answerLabel(content.answers.anyoneHurt)}
          </Text>
          <Text style={styles.body}>
            Anything damaged? {answerLabel(content.answers.anythingDamaged)}
          </Text>
          <Text style={styles.body}>
            Environmental impact?{' '}
            {answerLabel(content.answers.environmentalImpact)}
          </Text>
          {edit && (
            <Button
              label="Edit answers"
              variant="tertiary"
              onPress={edit.questions}
            />
          )}
        </AppCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  section: { gap: spacing[1] },
  label: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  value: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  photo: {
    width: 128,
    height: 128,
    borderRadius: radius.md,
    backgroundColor: colors.warmBone,
  },
});
