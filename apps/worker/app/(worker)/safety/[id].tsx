import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AppCard,
  Button,
  EmptyState,
  InlineAlert,
  StatusBadge,
  TextInput,
} from '@/components/ui';
import type { LocalPhotoEvidence } from '@/reporting/model';
import { useReporting } from '@/reporting/provider';
import type {
  ChecklistAnswerValue,
  ChecklistItem,
  SafetyChecklist,
} from '@/safety/model';
import { useSafety } from '@/safety/provider';

function formatDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ItemCardProps {
  item: ChecklistItem;
  index: number;
  checklist: SafetyChecklist;
  readOnly: boolean;
  onAnswer(val: ChecklistAnswerValue): void;
  onNoteChange(text: string): void;
  onPickPhoto(source: 'camera' | 'library'): void;
  onRemovePhoto(): void;
  onReportIssue(): void;
}

function ItemCard({
  item,
  index,
  checklist,
  readOnly,
  onAnswer,
  onNoteChange,
  onPickPhoto,
  onRemovePhoto,
  onReportIssue,
}: ItemCardProps) {
  const response = checklist.responses[item.id] ?? {
    itemId: item.id,
    answer: null,
  };
  const answer = response.answer;
  const isNo = answer === 'no';
  const showIssueBox = isNo && item.issueTriggerOnNo && !readOnly;
  const [showOptionalNote, setShowOptionalNote] = useState(
    Boolean(response.note),
  );

  return (
    <AppCard>
      <View style={styles.itemHeader}>
        <Text style={styles.itemNumber}>{index + 1}.</Text>
        <Text style={styles.itemPrompt}>{item.prompt}</Text>
      </View>

      {/* Answer buttons: Yes / No / N/A */}
      <View
        style={styles.segmentedRow}
        accessibilityRole="radiogroup"
        accessibilityLabel={item.prompt}
      >
        {(['yes', 'no', 'na'] as const).map((opt) => {
          const isSelected = answer === opt;
          const label = opt === 'yes' ? 'Yes' : opt === 'no' ? 'No' : 'N/A';
          return (
            <Pressable
              key={opt}
              disabled={readOnly}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled: readOnly }}
              accessibilityLabel={`${label} for ${item.prompt}`}
              onPress={() => onAnswer(opt)}
              style={[
                styles.segmentButton,
                isSelected && styles.segmentButtonSelected,
                isSelected && opt === 'no' && styles.segmentButtonNoSelected,
                readOnly && styles.readOnlyButton,
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  isSelected && styles.segmentLabelSelected,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* When answer is No and issue trigger is enabled: reveal Add note, Add photo, Report this issue */}
      {showIssueBox ? (
        <View style={styles.issueBox}>
          <InlineAlert
            tone="warning"
            title="Issue identified"
            message="You answered No. Add details or report this issue so HSE can follow up."
          />

          <TextInput
            label="Note"
            placeholder="Describe what is wrong..."
            value={response.note || ''}
            onChangeText={onNoteChange}
            multiline
          />

          {response.photo ? (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: response.photo.uri }}
                style={styles.previewPhoto}
                accessibilityLabel="Item issue photo"
              />
              <Text style={styles.photoName}>{response.photo.fileName}</Text>
              <Button
                label="Remove photo"
                variant="tertiary"
                onPress={onRemovePhoto}
              />
            </View>
          ) : item.supportsPhotos ? (
            <View style={styles.photoActionsRow}>
              <Button
                label="Add photo"
                variant="tertiary"
                onPress={() => onPickPhoto('library')}
              />
              <Button
                label="Take photo"
                variant="tertiary"
                onPress={() => onPickPhoto('camera')}
              />
            </View>
          ) : null}

          <Button
            label="Report this issue"
            variant="secondary"
            onPress={onReportIssue}
          />
        </View>
      ) : null}

      {/* Optional note when answer is Yes or NA */}
      {!isNo && !readOnly && item.supportsNotes ? (
        <View style={styles.optionalNoteSection}>
          {showOptionalNote ? (
            <TextInput
              label="Optional note"
              placeholder="Add observation note..."
              value={response.note || ''}
              onChangeText={onNoteChange}
            />
          ) : (
            <Button
              label="+ Add note"
              variant="tertiary"
              onPress={() => setShowOptionalNote(true)}
            />
          )}
        </View>
      ) : null}

      {/* Read-only note or photo if completed */}
      {readOnly && (response.note || response.photo) ? (
        <View style={styles.readOnlyDetails}>
          {response.note ? (
            <Text style={styles.readOnlyNote}>Note: {response.note}</Text>
          ) : null}
          {response.photo ? (
            <Image
              source={{ uri: response.photo.uri }}
              style={styles.previewPhoto}
              accessibilityLabel="Attached photo"
            />
          ) : null}
        </View>
      ) : null}
    </AppCard>
  );
}

export default function ChecklistDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getChecklist, setAnswer, setNote, setPhoto, submitChecklist } =
    useSafety();
  const { startReportFromChecklist } = useReporting();

  const checklist = id ? getChecklist(id) : null;
  const [submittedBanner, setSubmittedBanner] = useState(false);

  if (!checklist) {
    return (
      <View style={styles.content}>
        <EmptyState
          title="Checklist not found"
          description="The requested safety check is not available."
          action={
            <Button
              label="Back to Safety"
              onPress={() => router.replace('/safety')}
            />
          }
        />
      </View>
    );
  }

  const readOnly = checklist.status === 'completed';
  const totalItems = checklist.items.length;
  const answeredCount = Object.values(checklist.responses).filter(
    (r) => r.answer !== null,
  ).length;
  const allAnswered = answeredCount === totalItems;

  async function handlePickPhoto(itemId: string, source: 'camera' | 'library') {
    if (!checklist) return;
    try {
      if (source === 'camera' && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
            });
      if (result.canceled || !result.assets[0]?.uri) return;
      const asset = result.assets[0];
      const photo: LocalPhotoEvidence = {
        uri: asset.uri,
        fileName:
          asset.fileName ||
          (source === 'camera' ? 'Checklist photo' : 'Selected photo'),
        mimeType: asset.mimeType || null,
        fileSize: asset.fileSize ?? null,
        width: asset.width,
        height: asset.height,
        source,
      };
      setPhoto(checklist.id, itemId, photo);
    } catch {
      // Permission or device cancel
    }
  }

  function handleReportIssue(item: ChecklistItem) {
    if (!checklist) return;
    const response = checklist.responses[item.id];
    startReportFromChecklist({
      checklistId: checklist.id,
      checklistTitle: checklist.title,
      itemId: item.id,
      itemPrompt: item.prompt,
      workAreaId: item.workAreaId || checklist.workAreaId || null,
      note: response?.note,
      photo: response?.photo,
    });
    router.push('/report/details');
  }

  function handleSubmit() {
    if (!checklist) return;
    const ok = submitChecklist(checklist.id);
    if (ok) {
      setSubmittedBanner(true);
    }
  }

  return (
    <View style={styles.content}>
      <Button
        label="Back to Safety"
        variant="tertiary"
        onPress={() => router.replace('/safety')}
      />

      <View style={styles.header}>
        <Text style={styles.title}>{checklist.title}</Text>
        <Text style={styles.subtitle}>
          {[checklist.siteName, checklist.workAreaName]
            .filter(Boolean)
            .join(' · ')}
        </Text>
        <View style={styles.statusRow}>
          <StatusBadge
            label={checklist.status === 'completed' ? 'Completed' : 'Assigned'}
            tone={checklist.status === 'completed' ? 'success' : 'information'}
          />
          <Text style={styles.dueLabel}>{checklist.dueLabel}</Text>
        </View>
        {checklist.description ? (
          <Text style={styles.description}>{checklist.description}</Text>
        ) : null}
      </View>

      {submittedBanner || checklist.status === 'completed' ? (
        <InlineAlert
          tone="success"
          title="Checklist completed"
          message={`Completed on ${formatDate(checklist.submittedAt || new Date().toISOString())}. Recorded locally on this device.`}
        />
      ) : null}

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          Progress: {answeredCount} of {totalItems} items answered
        </Text>
      </View>

      {/* Items list */}
      <View style={styles.itemsList}>
        {checklist.items.map((item, idx) => (
          <ItemCard
            key={item.id}
            item={item}
            index={idx}
            checklist={checklist}
            readOnly={readOnly}
            onAnswer={(val) => setAnswer(checklist.id, item.id, val)}
            onNoteChange={(text) => setNote(checklist.id, item.id, text)}
            onPickPhoto={(source) => handlePickPhoto(item.id, source)}
            onRemovePhoto={() => setPhoto(checklist.id, item.id, null)}
            onReportIssue={() => handleReportIssue(item)}
          />
        ))}
      </View>

      {/* Submit / Finish action */}
      {!readOnly ? (
        <View style={styles.submitSection}>
          <Button
            label="Submit checklist"
            disabled={!allAnswered}
            onPress={handleSubmit}
          />
          {!allAnswered ? (
            <Text style={styles.submitHint}>
              Answer all items to complete this check.
            </Text>
          ) : null}
        </View>
      ) : (
        <Button
          label="Back to Safety"
          variant="secondary"
          onPress={() => router.replace('/safety')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3], paddingBottom: spacing[4] },
  header: { gap: spacing[1] },
  title: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  dueLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
  description: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing[1],
  },
  progressContainer: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    backgroundColor: colors.warmBone,
    borderRadius: radius.md,
  },
  progressLabel: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  itemsList: { gap: spacing[2] },
  itemHeader: {
    flexDirection: 'row',
    gap: spacing[1],
    alignItems: 'flex-start',
  },
  itemNumber: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  itemPrompt: {
    flex: 1,
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: spacing[1],
    marginTop: spacing[2],
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonSelected: {
    backgroundColor: colors.graphite,
    borderColor: colors.graphite,
  },
  segmentButtonNoSelected: {
    backgroundColor: colors.critical,
    borderColor: colors.critical,
  },
  readOnlyButton: {
    opacity: 0.6,
  },
  segmentLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.graphite,
  },
  segmentLabelSelected: {
    color: colors.white,
  },
  issueBox: {
    marginTop: spacing[2],
    gap: spacing[2],
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    paddingLeft: spacing[2],
  },
  photoContainer: {
    gap: spacing[1],
  },
  previewPhoto: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    backgroundColor: colors.warmBone,
  },
  photoName: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  optionalNoteSection: {
    marginTop: spacing[1],
  },
  readOnlyDetails: {
    marginTop: spacing[1],
    gap: spacing[1],
  },
  readOnlyNote: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
  submitSection: {
    gap: spacing[1],
    marginTop: spacing[2],
  },
  submitHint: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    textAlign: 'center',
  },
});
