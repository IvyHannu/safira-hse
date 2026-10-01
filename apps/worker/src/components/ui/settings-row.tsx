import { useState, type ReactNode } from 'react';
import { colors, spacing, typography } from '@safira/design-tokens';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { focusState } from './focus-state';

interface SettingsRowProps {
  label: string;
  icon?: ReactNode;
  detail?: string;
  onPress?: () => void;
  disabled?: boolean;
  secondary?: boolean;
}

export function SettingsRow({
  label,
  icon,
  detail,
  onPress,
  disabled = false,
  secondary = false,
}: SettingsRowProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const unavailable = disabled || !onPress;
  const content = (
    <>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>
        {label}
      </Text>
      {detail && <Text style={styles.detail}>{detail}</Text>}
      {!unavailable && <CaretRight size={17} color={colors.graphite} />}
    </>
  );

  if (unavailable) {
    return (
      <View accessibilityLabel={`${label}, unavailable`} style={styles.row}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.row,
        focusState.base,
        hovered && styles.hovered,
        pressed && styles.pressed,
        focused && focusState.focused,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomColor: colors.coolConcrete,
  },
  hovered: { backgroundColor: colors.coolSurface },
  pressed: { backgroundColor: colors.coolConcrete },
  icon: { width: 24, alignItems: 'center', justifyContent: 'center' },
  label: {
    flex: 1,
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryLabel: { color: colors.graphite, fontSize: 13 },
  detail: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
});
