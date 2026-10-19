import { useState, type ReactNode } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import Eye from 'phosphor-react-native/src/icons/Eye';
import EyeSlash from 'phosphor-react-native/src/icons/EyeSlash';
import CheckCircle from 'phosphor-react-native/src/icons/CheckCircle';
import Warning from 'phosphor-react-native/src/icons/Warning';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextInputProps,
} from 'react-native';
import { FormField } from './form-controls';
import { isVisibleKeyboardFocus } from './actions';
import { ScreenContainer } from './shell';

const fullLogo = require('../../../../../docs/references/brand/Safira Logo Full.png');

export function AuthShell({
  title,
  description,
  children,
  step,
  progress,
  subtleDescription = false,
  onboarding = false,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  step?: string;
  progress?: { current: number; total: number };
  subtleDescription?: boolean;
  onboarding?: boolean;
}) {
  return (
    <ScreenContainer>
      <View style={[styles.brand, onboarding && styles.onboardingBrand]}>
        <Image
          source={fullLogo}
          style={[styles.logo, onboarding && styles.onboardingLogo]}
          resizeMode="contain"
          accessibilityLabel="Safira"
        />
        <Text style={styles.brandContext}>WORKER</Text>
      </View>
      <View style={[styles.content, onboarding && styles.onboardingContent]}>
        {(step || progress) && (
          <View style={styles.phase}>
            <View style={styles.phaseHeading}>
              {step && <Text style={styles.step}>{step}</Text>}
              {progress && (
                <Text style={styles.progressCount}>
                  {String(progress.current).padStart(2, '0')} /{' '}
                  {String(progress.total).padStart(2, '0')}
                </Text>
              )}
            </View>
            {progress && (
              <View
                style={styles.progress}
                accessibilityRole="progressbar"
                accessibilityLabel={`${progress.current} of ${progress.total}`}
                accessibilityValue={{
                  min: 0,
                  max: progress.total,
                  now: progress.current,
                }}
              >
                {Array.from({ length: progress.total }, (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressSegment,
                      index < progress.current && styles.progressComplete,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text
            style={[
              styles.description,
              subtleDescription && styles.subtleDescription,
            ]}
          >
            {description}
          </Text>
        )}
        <View style={[styles.body, onboarding && styles.onboardingBody]}>
          {children}
        </View>
      </View>
    </ScreenContainer>
  );
}

export function AccountContext({
  organisation,
  site,
}: {
  organisation: string;
  site?: string;
}) {
  return (
    <View style={styles.context}>
      <Text style={styles.contextEyebrow}>YOUR WORKPLACE</Text>
      <Text style={styles.contextOrganisation}>{organisation}</Text>
      <View style={styles.contextDetails}>
        {site && <Text style={styles.contextDetail}>{site}</Text>}
        {site && <View style={styles.contextDot} />}
        <Text style={styles.contextDetail}>Worker access</Text>
      </View>
    </View>
  );
}

export function AccountMilestone({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View style={styles.milestone}>
      <View style={styles.milestoneIcon} accessibilityElementsHidden>
        <CheckCircle size={30} weight="bold" color={colors.signalYellow} />
      </View>
      <View style={styles.milestoneCopy}>
        <Text style={styles.milestoneTitle}>{title}</Text>
        <Text style={styles.milestoneMessage}>{message}</Text>
      </View>
    </View>
  );
}

export function SafetyGuidance({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View style={styles.safetyGuidance}>
      <View style={styles.safetyHeading}>
        <View style={styles.safetyIcon} accessibilityElementsHidden>
          <Warning size={24} weight="bold" color={colors.warning} />
        </View>
        <View style={styles.safetyHeadingCopy}>
          <Text style={styles.safetyEyebrow}>SAFETY GUIDANCE</Text>
          <Text style={styles.safetyTitle}>{title}</Text>
        </View>
      </View>
      <Text style={styles.safetyMessage}>{message}</Text>
    </View>
  );
}

export function AuthTextLink({
  label,
  onPress,
  role = 'link',
  align = 'start',
}: {
  label: string;
  onPress(): void;
  role?: 'link' | 'button';
  align?: 'start' | 'end';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole={role}
      onPress={onPress}
      onFocus={(event) => setFocused(isVisibleKeyboardFocus(event.target))}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.link,
        align === 'end' && styles.linkEnd,
        focused && styles.linkFocus,
        pressed && styles.linkPressed,
      ]}
    >
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

export function PasswordField({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const [visible, setVisible] = useState(false);
  const [visibilityFocused, setVisibilityFocused] = useState(false);
  return (
    <FormField
      {...props}
      label={label}
      error={error}
      secureTextEntry={!visible}
      autoCapitalize="none"
      trailingAction={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          accessibilityState={{ selected: visible }}
          onPress={() => setVisible(!visible)}
          onFocus={(event) =>
            setVisibilityFocused(isVisibleKeyboardFocus(event.target))
          }
          onBlur={() => setVisibilityFocused(false)}
          style={({ pressed }) => [
            styles.visibilityAction,
            visibilityFocused && styles.visibilityActionFocus,
            pressed && styles.linkPressed,
          ]}
        >
          {visible ? (
            <EyeSlash size={20} weight="regular" color={colors.graphite} />
          ) : (
            <Eye size={20} weight="regular" color={colors.graphite} />
          )}
        </Pressable>
      }
    />
  );
}

export const authStyles = StyleSheet.create({
  stack: { gap: 12 },
  actions: { gap: spacing[1], marginTop: spacing[1] },
  guidance: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
  },
  strong: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  brand: {
    minHeight: 96,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.deepCharcoal,
  },
  onboardingBrand: { minHeight: 80, paddingVertical: 4 },
  logo: { width: 68, height: 68 },
  onboardingLogo: { width: 56, height: 56 },
  brandContext: {
    color: colors.white,
    opacity: 0.7,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  content: { gap: 4, paddingVertical: 4 },
  onboardingContent: { flexGrow: 1 },
  phase: { gap: 6, marginBottom: 4 },
  phaseHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCount: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  progress: { flexDirection: 'row', gap: 5 },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.coolConcrete,
  },
  progressComplete: { backgroundColor: colors.signalYellow },
  step: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  title: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  description: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
  },
  subtleDescription: { fontSize: 13, lineHeight: 19 },
  body: { gap: 12, marginTop: 6 },
  onboardingBody: { flexGrow: 1 },
  context: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    gap: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.coolSurface,
  },
  contextDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  contextEyebrow: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  contextOrganisation: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  contextDetail: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  contextDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.graphite,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.deepCharcoal,
  },
  milestoneIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneCopy: { flex: 1, gap: 4 },
  milestoneTitle: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: '700',
  },
  milestoneMessage: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  safetyGuidance: {
    gap: spacing[1],
    padding: 12,
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    shadowColor: colors.deepCharcoal,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  safetyHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  safetyIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.coolSurface,
  },
  safetyHeadingCopy: { flex: 1, gap: 3 },
  safetyEyebrow: {
    color: colors.warning,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  safetyTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  safetyMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 21,
    marginLeft: 52,
  },
  visibilityAction: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  visibilityActionFocus: { borderColor: colors.signalYellow },
  link: {
    alignSelf: 'flex-start',
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing[1],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  linkEnd: { alignSelf: 'flex-end' },
  linkText: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  linkFocus: { borderColor: colors.signalYellow },
  linkPressed: { backgroundColor: colors.coolConcrete },
});
