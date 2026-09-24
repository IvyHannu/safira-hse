import { useId } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import {
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  View,
  type TextInputProps as NativeTextInputProps,
} from 'react-native';

interface TextInputProps extends NativeTextInputProps {
  label: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

export function TextInput({
  label,
  helperText,
  error,
  disabled = false,
  editable,
  multiline,
  ...props
}: TextInputProps) {
  const nativeId = useId();
  const inactive = disabled || editable === false;
  return (
    <View style={styles.field}>
      <Text nativeID={nativeId} style={styles.label}>
        {label}
      </Text>
      <NativeTextInput
        {...props}
        accessibilityLabel={label}
        accessibilityLabelledBy={nativeId}
        accessibilityHint={error || helperText}
        accessibilityState={{ disabled: inactive }}
        editable={!inactive}
        multiline={multiline}
        placeholderTextColor={colors.graphite}
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.errorInput,
          inactive && styles.disabled,
        ]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing[1] },
  label: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    color: colors.softBlack,
    paddingHorizontal: spacing[2],
    fontFamily: typography.fontFamily,
    fontSize: 16,
  },
  errorInput: { borderColor: colors.critical, borderWidth: 2 },
  multiline: {
    minHeight: 128,
    paddingVertical: spacing[2],
    textAlignVertical: 'top',
  },
  disabled: { opacity: 0.5, backgroundColor: colors.warmBone },
  helperText: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
  errorText: {
    color: colors.critical,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
});
