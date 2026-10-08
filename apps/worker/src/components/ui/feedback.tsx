import { useState, type ReactNode } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import type { IllustrationKey } from '@safira/design-tokens';
import Info from 'phosphor-react-native/src/icons/Info';
import Check from 'phosphor-react-native/src/icons/Check';
import CheckCircle from 'phosphor-react-native/src/icons/CheckCircle';
import WarningCircle from 'phosphor-react-native/src/icons/WarningCircle';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { IllustrationSlot } from './illustration-slot';

export type Tone = 'success' | 'warning' | 'critical' | 'information';

interface StatusBadgeProps {
  label: string;
  tone: Tone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <View
      accessibilityLabel={`Status: ${label}`}
      style={[
        styles.badge,
        { borderColor: colors[tone], backgroundColor: `${colors[tone]}12` },
      ]}
    >
      <Text style={[styles.badgeText, { color: colors[tone] }]}>{label}</Text>
    </View>
  );
}

export function StatusLabel({ label, tone }: StatusBadgeProps) {
  return (
    <View accessibilityLabel={`Status: ${label}`} style={styles.statusLabel}>
      {tone === 'success' ? (
        <Check size={14} weight="bold" color={colors.success} />
      ) : (
        <View style={[styles.statusDot, { backgroundColor: colors[tone] }]} />
      )}
      <Text style={[styles.statusLabelText, { color: colors[tone] }]}>
        {label}
      </Text>
    </View>
  );
}

export function ChecklistProgress({
  label,
  answered,
  total,
  completed = false,
  compact = false,
}: {
  label: string;
  answered: number;
  total: number;
  completed?: boolean;
  compact?: boolean;
}) {
  const percent = total > 0 ? Math.min(100, (answered / total) * 100) : 0;
  return (
    <View style={[styles.checklistProgress, compact && styles.progressCompact]}>
      <Text
        style={[
          styles.progressText,
          compact && styles.progressTextCompact,
          completed && styles.progressTextComplete,
        ]}
      >
        {label}
      </Text>
      {!compact && (
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: total, now: answered }}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${percent}%` as `${number}%` },
              completed && styles.progressFillComplete,
            ]}
          />
        </View>
      )}
    </View>
  );
}

export function StatusCard({
  tone,
  title,
  message,
}: {
  tone: Tone;
  title: string;
  message: string;
}) {
  const Icon = tone === 'success' ? CheckCircle : Info;
  return (
    <View style={[styles.statusCard, { borderLeftColor: colors[tone] }]}>
      <View accessibilityElementsHidden>
        <Icon size={20} color={colors[tone]} weight="bold" />
      </View>
      <View style={styles.statusCardCopy}>
        <Text style={styles.statusCardTitle}>{title}</Text>
        <Text style={styles.statusCardMessage}>{message}</Text>
      </View>
    </View>
  );
}

export function IssuePanel({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.issuePanel}>
      <View style={styles.issueHeading}>
        <WarningCircle size={18} color={colors.warning} weight="bold" />
        <Text style={styles.issueTitle}>{title}</Text>
      </View>
      <Text style={styles.issueMessage}>{message}</Text>
      {children}
    </View>
  );
}

export function ValidationMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.validation}
    >
      {message}
    </Text>
  );
}

interface AppCardProps {
  title?: string;
  children: ReactNode;
}

export function AppCard({ title, children }: AppCardProps) {
  return (
    <View style={styles.card}>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {children}
    </View>
  );
}

export function PressableCard({
  children,
  label,
  onPress,
  style,
}: {
  children: ReactNode;
  label: string;
  onPress(): void;
  style?: StyleProp<ViewStyle>;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.card,
        hovered && styles.cardHover,
        pressed && styles.cardPressed,
        focused && styles.cardFocused,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function InfoCard({ message }: { message: string }) {
  return (
    <View style={styles.infoCard}>
      <View accessibilityElementsHidden>
        <Info size={18} color={colors.deepCharcoal} />
      </View>
      <Text style={styles.infoCardText}>{message}</Text>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  illustrationKey?: IllustrationKey;
}

export function EmptyState({
  title,
  description,
  action,
  illustrationKey = 'empty',
}: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <IllustrationSlot illustrationKey={illustrationKey} decorative compact />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action}
    </View>
  );
}

interface InlineAlertProps {
  tone: Tone;
  title: string;
  message: string;
}

export function InlineAlert({ tone, title, message }: InlineAlertProps) {
  return (
    <View
      accessibilityRole="alert"
      style={[styles.alert, { borderLeftColor: colors[tone] }]}
    >
      <Text style={[styles.alertTitle, { color: colors[tone] }]}>{title}</Text>
      <Text style={styles.alertMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabelText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  checklistProgress: { gap: spacing[1] },
  progressCompact: { gap: 0 },
  progressText: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  progressTextCompact: { color: colors.graphite, fontSize: 13 },
  progressTextComplete: { color: colors.success },
  progressTrack: {
    height: 5,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: colors.coolConcrete,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.signalYellow,
  },
  progressFillComplete: { backgroundColor: colors.success },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[1],
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.coolSurface,
    padding: spacing[2],
  },
  statusCardCopy: { flex: 1, gap: 4 },
  statusCardTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  statusCardMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  issuePanel: {
    gap: spacing[1],
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: radius.sm,
    backgroundColor: `${colors.warning}08`,
    padding: spacing[2],
  },
  issueHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  issueTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  issueMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[1],
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing[2],
    gap: spacing[1],
    shadowColor: colors.deepCharcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
  },
  cardHover: {
    borderColor: colors.graphite,
    backgroundColor: colors.coolSurface,
    shadowOpacity: 0.12,
  },
  cardPressed: {
    backgroundColor: colors.coolConcrete,
    transform: [{ scale: 0.99 }],
  },
  cardFocused: { borderWidth: 2, borderColor: colors.deepCharcoal },
  infoRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[1],
  },
  infoLabel: {
    flex: 1,
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  infoValue: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[1],
    borderLeftWidth: 3,
    borderLeftColor: colors.signalYellow,
    borderRadius: radius.sm,
    backgroundColor: colors.coolSurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  infoCardText: {
    flex: 1,
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeader: { gap: spacing[1] },
  sectionTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '600',
  },
  description: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing[3],
    gap: spacing[1],
  },
  emptyTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
  },
  alert: {
    borderLeftWidth: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    padding: spacing[2],
    gap: spacing[1],
  },
  alertTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  alertMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    lineHeight: 21,
  },
  validation: {
    color: colors.critical,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
});
