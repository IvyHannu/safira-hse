import { useState } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import ArrowLeft from 'phosphor-react-native/src/icons/ArrowLeft';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';

export { ChoiceCard as SelectableCard } from './form-controls';

export type ButtonVariant =
  'primary' | 'secondary' | 'tertiary' | 'destructive';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  ...props
}: ButtonProps) {
  const inactive = disabled || loading;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const foreground = variant === 'destructive' ? colors.white : colors.graphite;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={loading ? `${label}, loading` : label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        hovered && !inactive && styles[`${variant}Hover`],
        pressed && !inactive && styles[`${variant}Pressed`],
        focused && !inactive && styles.focused,
        inactive && styles.disabled,
      ]}
    >
      <View style={styles.buttonContent}>
        <Text style={[styles.buttonLabel, { color: foreground }]}>
          {loading ? `${label}…` : label}
        </Text>
      </View>
    </Pressable>
  );
}

interface WorkerHeaderProps {
  backLabel: string;
  onBack(): void;
  context?: string;
  inset?: boolean;
}

export function WorkerHeader({
  backLabel,
  onBack,
  context,
  inset = false,
}: WorkerHeaderProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <View style={[styles.header, inset && styles.headerInset]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => [
          styles.headerBack,
          hovered && styles.headerBackHover,
          pressed && styles.headerBackPressed,
        ]}
      >
        <ArrowLeft size={22} color={colors.deepCharcoal} />
      </Pressable>
      {context && <Text style={styles.headerContext}>{context}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  buttonLabel: {
    fontFamily: typography.fontFamily,
    fontWeight: '600',
    fontSize: 16,
  },
  primary: {
    backgroundColor: colors.signalYellow,
    borderColor: colors.signalYellow,
  },
  primaryHover: {
    borderColor: colors.deepCharcoal,
    shadowColor: colors.graphite,
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  primaryPressed: { borderColor: colors.deepCharcoal, opacity: 0.72 },
  secondary: { backgroundColor: colors.white, borderColor: colors.graphite },
  secondaryHover: {
    backgroundColor: colors.coolSurface,
    borderColor: colors.deepCharcoal,
  },
  secondaryPressed: {
    backgroundColor: colors.coolConcrete,
    borderColor: colors.deepCharcoal,
  },
  tertiary: {
    backgroundColor: colors.coolSurface,
    borderColor: colors.coolSurface,
  },
  tertiaryHover: {
    backgroundColor: colors.coolConcrete,
    borderColor: colors.coolConcrete,
  },
  tertiaryPressed: {
    backgroundColor: colors.coolConcrete,
    borderColor: colors.graphite,
  },
  destructive: {
    backgroundColor: colors.critical,
    borderColor: colors.critical,
  },
  destructiveHover: {
    backgroundColor: colors.deepCharcoal,
    borderColor: colors.deepCharcoal,
  },
  destructivePressed: {
    backgroundColor: colors.graphite,
    borderColor: colors.graphite,
  },
  focused: { borderWidth: 2, borderColor: colors.deepCharcoal },
  disabled: {
    opacity: 0.48,
    backgroundColor: colors.coolConcrete,
    borderColor: colors.coolConcrete,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.coolConcrete,
  },
  headerInset: { paddingHorizontal: spacing[2] },
  headerBack: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  headerBackHover: { backgroundColor: colors.coolSurface },
  headerBackPressed: { backgroundColor: colors.coolConcrete },
  headerContext: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
});
