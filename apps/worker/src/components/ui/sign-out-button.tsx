import { useState } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import SignOut from 'phosphor-react-native/src/icons/SignOut';
import { Pressable, StyleSheet, Text } from 'react-native';
import { focusState } from './focus-state';

export function SignOutButton({ onPress }: { onPress(): void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        focusState.base,
        hovered && styles.hovered,
        pressed && styles.pressed,
        focused && focusState.focused,
        focused && styles.focused,
      ]}
    >
      <SignOut size={18} color={colors.signalYellow} weight="bold" />
      <Text style={styles.label}>Sign out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.deepCharcoal,
    borderRadius: radius.md,
    backgroundColor: colors.deepCharcoal,
  },
  hovered: {
    borderColor: colors.signalYellow,
    backgroundColor: colors.graphite,
  },
  pressed: {
    borderColor: colors.signalYellow,
    backgroundColor: colors.deepCharcoal,
    transform: [{ scale: 0.98 }],
  },
  focused: {
    borderColor: colors.signalYellow,
    backgroundColor: colors.deepCharcoal,
  },
  label: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
});
