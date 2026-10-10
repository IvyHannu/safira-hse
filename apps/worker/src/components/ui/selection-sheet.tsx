import { useState, type ReactNode } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import X from 'phosphor-react-native/src/icons/X';
import Check from 'phosphor-react-native/src/icons/Check';
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

interface SelectionOptionProps {
  label: string;
  selected: boolean;
  onPress(): void;
}

export function SelectionOption({
  label,
  selected,
  onPress,
}: SelectionOptionProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed, hovered }) => [
        styles.option,
        selected && styles.optionSelected,
        hovered && !selected && styles.optionHovered,
        pressed && styles.optionPressed,
        focused && styles.optionFocused,
      ]}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
      {selected && (
        <Check size={18} weight="bold" color={colors.deepCharcoal} />
      )}
    </Pressable>
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
  option: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[1],
  },
  optionSelected: {
    borderColor: colors.signalYellow,
    backgroundColor: colors.white,
  },
  optionHovered: { backgroundColor: colors.coolSurface },
  optionPressed: { backgroundColor: colors.coolConcrete },
  optionFocused: { borderColor: colors.signalYellow },
  optionText: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '500',
  },
  optionTextSelected: { fontWeight: '700' },
});
