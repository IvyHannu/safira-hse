import { useState } from 'react';
import { colors, typography } from '@safira/design-tokens';
import { Image, StyleSheet, Text, View } from 'react-native';

export function ProfileAvatar({
  name,
  photoUri,
  variant = 'profile',
}: {
  name: string;
  photoUri?: string | null;
  variant?: 'profile' | 'header';
}) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      style={[styles.avatar, variant === 'header' && styles.headerAvatar]}
      accessibilityLabel={`${name} avatar`}
    >
      {photoUri && photoUri !== failedUri ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel={`${name} profile photo`}
          onError={() => setFailedUri(photoUri)}
        />
      ) : (
        <Text
          style={[styles.initial, variant === 'header' && styles.headerInitial]}
        >
          {initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coolConcrete,
  },
  photo: { width: '100%', height: '100%' },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.signalYellow,
  },
  initial: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  headerInitial: { fontSize: 14 },
});
