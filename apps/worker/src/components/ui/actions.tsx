import { colors, radius, spacing, typography } from '@safira/design-tokens';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';

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
  ...props
}: ButtonProps) {
  const inactive = disabled || loading;
  const foreground = variant === 'destructive' ? colors.white : colors.graphite;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={loading ? `${label}, loading` : label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !inactive && styles.pressed,
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

interface SelectableCardProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  title: string;
  description?: string;
  selected: boolean;
}

export function SelectableCard({
  title,
  description,
  selected,
  disabled,
  ...props
}: SelectableCardProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={!!disabled}
      style={({ pressed }) => [
        styles.selectableCard,
        selected && styles.selectedCard,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      {description && <Text style={styles.cardDescription}>{description}</Text>}
      {selected && <Text style={styles.selectedLabel}>Selected</Text>}
    </Pressable>
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
  primary: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  secondary: { backgroundColor: colors.white, borderColor: colors.graphite },
  tertiary: { backgroundColor: colors.warmBone, borderColor: colors.warmBone },
  destructive: {
    backgroundColor: colors.critical,
    borderColor: colors.critical,
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.45 },
  selectableCard: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing[2],
  },
  selectedCard: { borderWidth: 2, backgroundColor: colors.warmBone },
  cardTitle: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
    fontSize: 16,
  },
  cardDescription: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    marginTop: spacing[1],
    lineHeight: 21,
  },
  selectedLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
    marginTop: spacing[1],
  },
});
