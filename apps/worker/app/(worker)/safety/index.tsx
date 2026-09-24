import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  EmptyState,
  SectionHeader,
  StatusBadge,
  type Tone,
} from '@/components/ui';
import type { SafetyChecklist } from '@/safety/model';
import { useSafety } from '@/safety/provider';

interface ChecklistCardProps {
  checklist: SafetyChecklist;
  onPress(): void;
}

function getCompletionText(checklist: SafetyChecklist): string {
  if (checklist.status === 'completed') return 'Completed';
  const total = checklist.items.length;
  const answered = Object.values(checklist.responses).filter(
    (r) => r.answer !== null,
  ).length;
  if (answered === 0) return 'Not started';
  return `${answered} of ${total} answered`;
}

function getBadgeConfig(checklist: SafetyChecklist): {
  label: string;
  tone: Tone;
} {
  if (checklist.status === 'completed') {
    return { label: 'Completed', tone: 'success' };
  }
  if (checklist.status === 'in_progress') {
    return { label: 'In progress', tone: 'warning' };
  }
  if (checklist.assignedToWorker) {
    return { label: 'Assigned to you', tone: 'information' };
  }
  return { label: 'Available', tone: 'information' };
}

function ChecklistCard({ checklist, onPress }: ChecklistCardProps) {
  const badge = getBadgeConfig(checklist);
  const completionText = getCompletionText(checklist);
  const location = [checklist.siteName, checklist.workAreaName]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${checklist.title}, ${badge.label}, ${completionText}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{checklist.title}</Text>
        <StatusBadge label={badge.label} tone={badge.tone} />
      </View>
      <Text style={styles.cardMeta}>{location}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.cardMeta}>{checklist.items.length} items</Text>
        <Text style={styles.cardMeta}>·</Text>
        <Text style={styles.cardMeta}>{checklist.dueLabel}</Text>
        <Text style={styles.cardMeta}>·</Text>
        <Text
          style={[
            styles.completionText,
            checklist.status === 'completed' && styles.completedText,
          ]}
        >
          {completionText}
        </Text>
      </View>
      {checklist.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {checklist.description}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function SafetyScreen() {
  const router = useRouter();
  const { checklists } = useSafety();

  // Sort: Assigned incomplete first, then other incomplete, then completed
  const sorted = [...checklists].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    if (a.assignedToWorker && !b.assignedToWorker) return -1;
    if (!a.assignedToWorker && b.assignedToWorker) return 1;
    return a.title.localeCompare(b.title);
  });

  return (
    <View style={styles.content}>
      <SectionHeader
        title="Safety checks"
        description="Assigned site checklists and routine inspections."
      />

      {sorted.length === 0 ? (
        <EmptyState
          title="No checklists assigned"
          description="There are currently no active safety checks for your shift."
        />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChecklistCard
              checklist={item}
              onPress={() => router.push(`/safety/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  list: { gap: spacing[2] },
  card: {
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing[2],
    gap: spacing[1],
  },
  cardPressed: { opacity: 0.8 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[1],
  },
  cardTitle: {
    flex: 1,
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  cardMeta: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    flexWrap: 'wrap',
  },
  completionText: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  completedText: {
    color: colors.success,
  },
  cardDescription: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
