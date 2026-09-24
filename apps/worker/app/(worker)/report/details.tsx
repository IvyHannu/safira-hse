import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import {
  AppCard,
  Button,
  InlineAlert,
  SectionHeader,
  SelectableCard,
  TextInput,
} from '@/components/ui';
import { workerHomeDemo } from '@/demo/worker-data';
import { useReporting } from '@/reporting/provider';
import type { LocalPhotoEvidence } from '@/reporting/model';

export default function EvidenceDetailsScreen() {
  const router = useRouter();
  const { state, updateDraft } = useReporting();
  const draft = state.draft;
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [photoUnavailable, setPhotoUnavailable] = useState(false);

  async function pickPhoto(source: 'camera' | 'library') {
    setError(null);
    try {
      if (source === 'camera' && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError(
            'Camera permission was not granted. Your existing report details are unchanged.',
          );
          return;
        }
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
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.uri) throw new Error('No photo URI returned');
      const evidence: LocalPhotoEvidence = {
        uri: asset.uri,
        fileName:
          asset.fileName ||
          (source === 'camera' ? 'Camera photo' : 'Selected photo'),
        mimeType: asset.mimeType || null,
        fileSize: asset.fileSize ?? null,
        width: asset.width,
        height: asset.height,
        source,
      };
      updateDraft({ evidenceChoice: 'photo', evidence });
      setPhotoUnavailable(false);
    } catch {
      setError(
        'The photo could not be added. Your existing report details are unchanged.',
      );
    }
  }

  function continueToQuestions() {
    setAttempted(true);
    if (
      draft.evidenceChoice === 'unanswered' ||
      (draft.evidenceChoice === 'photo' &&
        (!draft.evidence || photoUnavailable)) ||
      !draft.description.trim() ||
      !draft.workAreaId
    )
      return;
    router.push('/report/questions');
  }

  return (
    <View style={styles.content}>
      <Button
        label="Back to choices"
        variant="tertiary"
        onPress={() => router.replace('/report')}
      />
      <SectionHeader
        title="Evidence & details"
        description="Add what you know. A photo can help, and you can skip it."
      />

      <View style={styles.section}>
        <SectionHeader title="Photo evidence" />
        <View style={styles.actions}>
          <Button
            label="Take photo"
            variant="secondary"
            onPress={() => void pickPhoto('camera')}
          />
          <Button
            label="Upload photo"
            variant="secondary"
            onPress={() => void pickPhoto('library')}
          />
          <Button
            label="Skip photo"
            variant="tertiary"
            onPress={() => {
              updateDraft({ evidenceChoice: 'skipped', evidence: null });
              setError(null);
              setPhotoUnavailable(false);
            }}
          />
        </View>
        {draft.evidenceChoice === 'photo' && draft.evidence && (
          <AppCard title="Photo selected">
            <Image
              source={{ uri: draft.evidence.uri }}
              style={styles.photo}
              accessibilityLabel="Selected report photo"
              onError={() => setPhotoUnavailable(true)}
            />
            <Text style={styles.body}>{draft.evidence.fileName}</Text>
            <Text style={styles.helper}>
              Stored locally for this demo. No cloud upload.
            </Text>
          </AppCard>
        )}
        {draft.evidenceChoice === 'skipped' && (
          <Text style={styles.body}>
            Photo skipped. You can still add one before submitting.
          </Text>
        )}
        {photoUnavailable && (
          <InlineAlert
            tone="warning"
            title="Photo unavailable"
            message="The local photo URI no longer opens. Choose another photo or Skip before continuing."
          />
        )}
        {attempted && draft.evidenceChoice === 'unanswered' && (
          <Text style={styles.error}>
            Take a photo, upload one, or choose Skip.
          </Text>
        )}
        {error && (
          <InlineAlert
            tone="critical"
            title="Photo not added"
            message={error}
          />
        )}
      </View>

      <TextInput
        label="What happened or could happen?"
        helperText="Use your own words. Include the location or equipment if helpful."
        error={
          attempted && !draft.description.trim()
            ? 'Please add a short description.'
            : undefined
        }
        value={draft.description}
        onChangeText={(description) => updateDraft({ description })}
        multiline
        numberOfLines={5}
        maxLength={2000}
      />

      <AppCard title="Current site">
        <Text style={styles.site}>{workerHomeDemo.site.name}</Text>
        <Text style={styles.helper}>Prefilled for this demo</Text>
      </AppCard>

      <View
        style={styles.section}
        accessibilityRole="radiogroup"
        accessibilityLabel="Work area"
      >
        <SectionHeader
          title="Work area"
          description="Choose where you noticed it."
        />
        {workerHomeDemo.workAreas.map((area) => (
          <SelectableCard
            key={area.id}
            title={area.name}
            selected={draft.workAreaId === area.id}
            onPress={() => updateDraft({ workAreaId: area.id })}
          />
        ))}
        {attempted && !draft.workAreaId && (
          <Text style={styles.error}>Choose a work area.</Text>
        )}
      </View>
      <Button label="Continue" onPress={continueToQuestions} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  section: { gap: spacing[1] },
  actions: { gap: spacing[1] },
  photo: {
    width: 128,
    height: 128,
    borderRadius: radius.md,
    backgroundColor: colors.warmBone,
  },
  site: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
  helper: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
  error: {
    color: colors.critical,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
});
