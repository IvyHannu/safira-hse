import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import PencilSimple from 'phosphor-react-native/src/icons/PencilSimple';
import Trash from 'phosphor-react-native/src/icons/Trash';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useProfilePhoto } from '@/profile/photo-provider';
import { ValidationMessage } from './feedback';
import { ProfileAvatar } from './profile-avatar';

export function ProfilePhotoEditor({ name }: { name: string }) {
  const { photoUri, error: storageError, savePhoto } = useProfilePhoto();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  async function choosePhoto() {
    setActionsOpen(false);
    setBusy(true);
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.base64) {
        setError('This photo could not be saved. Choose another photo.');
        return;
      }
      if (asset.base64.length > 5_000_000) {
        setError('Choose a smaller photo to save on this device.');
        return;
      }
      savePhoto(
        `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`,
      );
    } catch {
      setError('This photo could not be opened. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <ProfileAvatar name={name} photoUri={photoUri} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit profile photo"
          disabled={busy}
          onPress={() => {
            if (photoUri) setActionsOpen((open) => !open);
            else void choosePhoto();
          }}
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressed,
            busy && styles.disabled,
          ]}
        >
          <View style={styles.editIcon}>
            <PencilSimple size={16} weight="bold" color={colors.deepCharcoal} />
          </View>
        </Pressable>
      </View>
      {actionsOpen && (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => void choosePhoto()}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <PencilSimple size={16} color={colors.deepCharcoal} />
            <Text style={styles.actionText}>Change photo</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              savePhoto(null);
              setActionsOpen(false);
              setError(null);
            }}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Trash size={16} color={colors.deepCharcoal} />
            <Text style={styles.actionText}>Remove photo</Text>
          </Pressable>
        </View>
      )}
      <ValidationMessage message={error || storageError || undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'flex-start', gap: spacing[1] },
  avatarWrap: { width: 64, height: 64, justifyContent: 'center' },
  editButton: {
    position: 'absolute',
    right: -8,
    bottom: -6,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  editIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 14,
    backgroundColor: colors.signalYellow,
  },
  actions: {
    minWidth: 160,
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  action: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
  },
  actionText: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: { backgroundColor: colors.coolSurface },
  disabled: { opacity: 0.5 },
});
