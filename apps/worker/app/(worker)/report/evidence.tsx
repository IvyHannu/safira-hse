import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import Camera from 'phosphor-react-native/src/icons/Camera';
import Plus from 'phosphor-react-native/src/icons/Plus';
import X from 'phosphor-react-native/src/icons/X';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ActionUploadField,
  Button,
  InlineAlert,
  SelectionSheet,
  WorkerHeader,
} from '@/components/ui';
import { workerHomeDemo } from '@/demo/worker-data';
import type { LocalPhotoEvidence } from '@/reporting/model';
import { useReporting } from '@/reporting/provider';

export default function AddEvidenceScreen() {
  const router = useRouter();
  const { state, updateDraft } = useReporting();
  const { evidence, evidenceChoice } = state.draft;
  const [sourceOpen, setSourceOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUnavailable, setPhotoUnavailable] = useState(false);
  const hasPhoto = evidenceChoice === 'photo' && !!evidence;

  async function pickPhoto(source: 'camera' | 'library') {
    setSourceOpen(false);
    setError(null);
    try {
      if (source === 'camera' && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError('Camera access was not granted. Your report is unchanged.');
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
      const localEvidence: LocalPhotoEvidence = {
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
      updateDraft({ evidenceChoice: 'photo', evidence: localEvidence });
      setPhotoUnavailable(false);
    } catch {
      setError('The photo could not be added. Your report is unchanged.');
    }
  }

  function skipEvidence() {
    updateDraft({ evidenceChoice: 'skipped', evidence: null });
    router.push('/report/questions');
  }

  function continueToQuestions() {
    if (photoUnavailable) {
      setError(
        'Remove the unavailable photo or choose another before continuing.',
      );
      return;
    }
    if (evidenceChoice === 'unanswered') {
      updateDraft({ evidenceChoice: 'skipped', evidence: null });
    }
    router.push('/report/questions');
  }

  return (
    <View style={styles.content}>
      <WorkerHeader
        backLabel="Back to report details"
        onBack={() => router.replace('/report/details')}
        context={workerHomeDemo.site.name}
        inset
      />

      <View style={styles.body}>
        <View style={styles.progress} accessibilityLabel="Report evidence step">
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={styles.progressSegment} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.title}>Add evidence (optional)</Text>
          <Text style={styles.helper}>
            Photos help the HSE team understand what&apos;s happened.
          </Text>
        </View>

        <View style={styles.photoRow}>
          {hasPhoto && evidence ? (
            <View style={styles.photoTile}>
              <Image
                source={{ uri: evidence.uri }}
                style={styles.photo}
                accessibilityLabel={`Selected photo, ${evidence.fileName}`}
                onError={() => setPhotoUnavailable(true)}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                onPress={() => {
                  updateDraft({ evidenceChoice: 'unanswered', evidence: null });
                  setPhotoUnavailable(false);
                  setError(null);
                }}
                style={styles.removeButton}
              >
                <X size={20} color={colors.white} />
              </Pressable>
            </View>
          ) : (
            <ActionUploadField
              label="Add photo"
              icon={<Camera size={26} color={colors.deepCharcoal} />}
              tile
              style={styles.uploadTile}
              onPress={() => setSourceOpen(true)}
            />
          )}
          <ActionUploadField
            label={hasPhoto ? 'Add another photo' : 'Choose a photo'}
            icon={
              hasPhoto ? (
                <Plus size={26} color={colors.deepCharcoal} />
              ) : (
                <Camera size={26} color={colors.deepCharcoal} />
              )
            }
            tile
            style={styles.uploadTile}
            onPress={() => setSourceOpen(true)}
          />
        </View>

        {photoUnavailable && (
          <InlineAlert
            tone="warning"
            title="Photo unavailable"
            message="This local photo no longer opens. Remove it or choose another."
          />
        )}
        {error && (
          <InlineAlert
            tone="critical"
            title="Photo not added"
            message={error}
          />
        )}

        <View style={styles.footer}>
          <View style={styles.footerAction}>
            <Button label="Skip" variant="tertiary" onPress={skipEvidence} />
          </View>
          <View style={styles.footerAction}>
            <Button label="Next" onPress={continueToQuestions} />
          </View>
        </View>
      </View>

      <SelectionSheet
        visible={sourceOpen}
        title="Add a photo"
        onClose={() => setSourceOpen(false)}
      >
        <Button label="Take photo" onPress={() => void pickPhoto('camera')} />
        <Button
          label="Choose from library"
          variant="secondary"
          onPress={() => void pickPhoto('library')}
        />
      </SelectionSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    marginHorizontal: -spacing[2],
    marginTop: -spacing[2],
    backgroundColor: colors.white,
  },
  body: {
    flexGrow: 1,
    gap: spacing[2],
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[2],
  },
  progress: { flexDirection: 'row', gap: 4 },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.coolConcrete,
  },
  progressActive: { backgroundColor: colors.signalYellow },
  intro: { gap: spacing[1] },
  title: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  helper: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  photoRow: { flexDirection: 'row', gap: spacing[1] },
  photoTile: {
    flex: 1,
    height: 160,
    overflow: 'hidden',
    borderRadius: radius.sm,
    backgroundColor: colors.coolSurface,
  },
  photo: { width: '100%', height: '100%' },
  removeButton: {
    position: 'absolute',
    top: spacing[1],
    right: spacing[1],
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.deepCharcoal,
  },
  uploadTile: { flex: 1 },
  footer: { flexDirection: 'row', gap: spacing[1], marginTop: 'auto' },
  footerAction: { flex: 1 },
});
