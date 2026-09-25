import { useState, type ReactNode } from 'react';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.card,
        hovered && styles.cardHover,
        pressed && styles.cardPressed,
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
    borderRadius: radius.md,
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
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing[2],
    gap: spacing[1],
    shadowColor: colors.deepCharcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
  },
  cardPressed: { backgroundColor: colors.coolConcrete },
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
