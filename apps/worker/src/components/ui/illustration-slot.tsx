import {
  colors,
  illustrationSlots,
  radius,
  type IllustrationKey,
} from '@safira/design-tokens';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const approvedAssets: Partial<Record<IllustrationKey, ImageSourcePropType>> =
  {};

/** Reserves a stable space for approved art without implying an image exists. */
export function IllustrationSlot({
  illustrationKey,
  compact = false,
  decorative = false,
  style,
}: {
  illustrationKey: IllustrationKey;
  compact?: boolean;
  decorative?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const slot = illustrationSlots[illustrationKey];
  const source = approvedAssets[illustrationKey];
  return (
    <View
      accessible={!!source && !decorative}
      accessibilityRole={source && !decorative ? 'image' : undefined}
      accessibilityLabel={source && !decorative ? slot.alt : undefined}
      importantForAccessibility={
        source && !decorative ? 'auto' : 'no-hide-descendants'
      }
      testID={`illustration-${slot.assetKey}`}
      style={[
        styles.slot,
        { aspectRatio: slot.aspectRatio },
        compact && styles.compact,
        style,
      ]}
    >
      {source && (
        <Image source={source} style={styles.image} resizeMode="contain" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    maxWidth: 192,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.coolSurface,
  },
  compact: { maxWidth: 128 },
  image: { width: '100%', height: '100%' },
});
