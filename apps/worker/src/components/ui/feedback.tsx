import type { ReactNode } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';

export type Tone = 'success' | 'warning' | 'critical' | 'information';

interface StatusBadgeProps {
  label: string;
  tone: Tone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { borderColor: colors[tone] }]}>
      <Text style={[styles.badgeText, { color: colors[tone] }]}>{label}</Text>
    </View>
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
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
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
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing[1],
    paddingVertical: spacing[1],
  },
  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing[2],
    gap: spacing[1],
  },
  cardTitle: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHeader: { gap: spacing[1] },
  sectionTitle: {
    color: colors.softBlack,
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
    borderColor: colors.graphite,
    borderRadius: radius.lg,
    padding: spacing[3],
    gap: spacing[1],
  },
  emptyTitle: {
    color: colors.softBlack,
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
});
