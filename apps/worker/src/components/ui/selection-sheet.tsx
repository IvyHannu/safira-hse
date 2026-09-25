import type { ReactNode } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import X from 'phosphor-react-native/src/icons/X';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface SelectionSheetProps {
  visible: boolean;
  title: string;
  onClose(): void;
  children: ReactNode;
}

export function SelectionSheet({
  visible,
  title,
  onClose,
  children,
}: SelectionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.scrim}
          accessibilityLabel={`Close ${title}`}
          onPress={onClose}
        />
        <View style={styles.sheet} accessibilityLabel={title}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close selection"
              onPress={onClose}
              style={({ pressed }) => [
                styles.close,
                pressed && styles.closePressed,
              ]}
            >
              <X size={20} color={colors.graphite} />
            </Pressable>
          </View>
          <View style={styles.options}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: `${colors.deepCharcoal}70`,
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderColor: colors.coolConcrete,
    borderWidth: 1,
    paddingHorizontal: spacing[2],
    paddingTop: spacing[1],
    paddingBottom: spacing[3],
    gap: spacing[1],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  closePressed: { backgroundColor: colors.coolConcrete },
  options: { gap: 4 },
});
