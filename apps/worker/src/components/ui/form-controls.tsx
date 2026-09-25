import { useId, useState, type ReactNode } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import Check from 'phosphor-react-native/src/icons/Check';
import CaretDown from 'phosphor-react-native/src/icons/CaretDown';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps as NativeTextInputProps,
  type ViewStyle,
} from 'react-native';
import { ValidationMessage } from './feedback';

interface FormFieldProps extends NativeTextInputProps {
  label: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  minimumHeight?: number;
}

export function FormField({
  label,
  helperText,
  error,
  disabled = false,
  editable,
  multiline,
  minimumHeight,
  onFocus,
  onBlur,
  value,
  ...props
}: FormFieldProps) {
  const labelId = useId();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inactive = disabled || editable === false;
  return (
    <View style={styles.field}>
      <Text nativeID={labelId} style={styles.label}>
        {label}
      </Text>
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => [
          styles.surface,
          multiline && styles.multilineSurface,
          minimumHeight !== undefined && { minHeight: minimumHeight },
          Boolean(value) && styles.filled,
          hovered && !inactive && styles.hovered,
          pressed && !inactive && styles.pressed,
          focused && styles.focused,
          error && styles.errorSurface,
          inactive && styles.disabled,
        ]}
      >
        <NativeTextInput
          {...props}
          value={value}
          accessibilityLabel={label}
          accessibilityLabelledBy={labelId}
          accessibilityHint={error || helperText}
          accessibilityState={{ disabled: inactive }}
          editable={!inactive}
          multiline={multiline}
          placeholderTextColor={colors.graphite}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, multiline && styles.multilineInput]}
        />
      </Pressable>
      {error ? (
        <ValidationMessage message={error} />
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

export function TextArea(props: Omit<FormFieldProps, 'multiline'>) {
  return (
    <FormField {...props} multiline minimumHeight={props.minimumHeight ?? 88} />
  );
}

interface SelectFieldProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  value?: string | null;
  placeholder: string;
  leadingIcon?: ReactNode;
  error?: string;
  expanded?: boolean;
}

export function SelectField({
  label,
  value,
  placeholder,
  leadingIcon,
  error,
  expanded = false,
  disabled,
  ...props
}: SelectFieldProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        {...props}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value || placeholder}`}
        accessibilityState={{ expanded, disabled: !!disabled }}
        disabled={disabled}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => [
          styles.surface,
          styles.selectSurface,
          value && styles.filled,
          hovered && !disabled && styles.hovered,
          pressed && !disabled && styles.pressed,
          (focused || expanded) && styles.focused,
          error && styles.errorSurface,
          disabled && styles.disabled,
        ]}
      >
        {leadingIcon && <View style={styles.iconArea}>{leadingIcon}</View>}
        <Text style={[styles.controlText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <CaretDown size={18} color={colors.graphite} />
      </Pressable>
      <ValidationMessage message={error} />
    </View>
  );
}

interface DateTimeFieldProps {
  value: string;
  icon: ReactNode;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  error?: boolean;
}

export function DateTimeField({
  value,
  icon,
  accessibilityLabel,
  style,
  onPress,
  disabled = false,
  error = false,
}: DateTimeFieldProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const content = (
    <>
      <View style={styles.iconArea}>{icon}</View>
      <Text style={styles.dateTimeText}>{value}</Text>
    </>
  );
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={({ pressed }) => [
          styles.surface,
          styles.dateTimeSurface,
          styles.filled,
          hovered && !disabled && styles.hovered,
          pressed && !disabled && styles.pressed,
          focused && styles.focused,
          error && styles.errorSurface,
          disabled && styles.disabled,
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.surface,
        styles.dateTimeSurface,
        styles.filled,
        error && styles.errorSurface,
        disabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </View>
  );
}

interface ChoiceCardProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  description?: string;
  leading?: ReactNode;
  selected: boolean;
  error?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ChoiceCard({
  title,
  description,
  leading,
  selected,
  error,
  disabled,
  style,
  ...props
}: ChoiceCardProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...props}
      accessibilityRole="radio"
      accessibilityLabel={props.accessibilityLabel || title}
      accessibilityState={{ checked: selected, selected, disabled: !!disabled }}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.surface,
        styles.choice,
        selected && styles.choiceSelected,
        hovered && !disabled && styles.hovered,
        pressed && !disabled && styles.pressed,
        focused && styles.focused,
        error && styles.errorSurface,
        disabled && styles.disabled,
        style,
      ]}
    >
      {leading}
      <View style={styles.choiceCopy}>
        <Text style={styles.choiceTitle}>{title}</Text>
        {description && (
          <Text style={styles.choiceDescription}>{description}</Text>
        )}
      </View>
      <View style={[styles.indicator, selected && styles.indicatorSelected]}>
        {selected && (
          <Check size={14} weight="bold" color={colors.deepCharcoal} />
        )}
      </View>
    </Pressable>
  );
}

interface ActionUploadFieldProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  label: string;
  icon: ReactNode;
  tile?: boolean;
  selected?: boolean;
  error?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ActionUploadField({
  label,
  icon,
  tile = false,
  selected = false,
  error = false,
  disabled,
  style,
  ...props
}: ActionUploadFieldProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.surface,
        styles.upload,
        tile && styles.uploadTile,
        selected && styles.choiceSelected,
        hovered && !disabled && styles.hovered,
        pressed && !disabled && styles.pressed,
        focused && styles.focused,
        error && styles.errorSurface,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.uploadIcon}>{icon}</View>
      <Text style={styles.uploadLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing[1] },
  label: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  surface: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    shadowColor: colors.deepCharcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  filled: { borderColor: colors.graphite, backgroundColor: colors.white },
  hovered: {
    borderColor: colors.graphite,
    backgroundColor: colors.coolSurface,
  },
  pressed: { backgroundColor: colors.coolConcrete },
  focused: {
    borderWidth: 2,
    borderColor: colors.signalYellow,
    backgroundColor: colors.white,
  },
  errorSurface: {
    borderColor: colors.critical,
    backgroundColor: `${colors.critical}08`,
  },
  disabled: { opacity: 0.5, backgroundColor: colors.coolSurface },
  input: {
    minHeight: 46,
    paddingHorizontal: spacing[2],
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
  },
  multilineSurface: { minHeight: 88 },
  multilineInput: {
    flex: 1,
    paddingVertical: spacing[1],
    textAlignVertical: 'top',
  },
  selectSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[1],
  },
  iconArea: {
    width: 28,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    flex: 1,
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
  placeholder: { color: colors.graphite },
  dateTimeSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[1],
  },
  dateTimeText: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  choiceSelected: {
    borderWidth: 2,
    borderColor: colors.signalYellow,
    backgroundColor: colors.coolSurface,
  },
  choiceCopy: { flex: 1, gap: 2 },
  choiceTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  choiceDescription: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  indicator: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  indicatorSelected: {
    borderColor: colors.signalYellow,
    backgroundColor: colors.signalYellow,
  },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[1],
  },
  uploadTile: {
    minHeight: 160,
    flexDirection: 'column',
    gap: spacing[1],
    backgroundColor: colors.coolSurface,
  },
  uploadIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.coolConcrete,
  },
  uploadLabel: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  helperText: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
});
