import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import type { ReportStatus } from '@safira/types';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  EmptyState,
  PressableCard,
  SectionHeader,
  StatusBadge,
  type Tone,
} from '@/components/ui';
import type { DemoReport } from '@/reporting/model';
import { useReporting } from '@/reporting/provider';

type FilterKey = 'all' | 'active' | 'resolved';

const ACTIVE_STATUSES: readonly ReportStatus[] = [
  'submitted',
  'under_review',
  'action_required',
];

const STATUS_CONFIG: Record<ReportStatus, { label: string; tone: Tone }> = {
  submitted: { label: 'Submitted', tone: 'information' },
  under_review: { label: 'Under review', tone: 'information' },
  action_required: { label: 'More info needed', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'success' },
};

const FILTERS: readonly { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'resolved', label: 'Resolved' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface ReportCardProps {
  report: DemoReport;
  onPress(): void;
}

function ReportCard({ report, onPress }: ReportCardProps) {
  const { label, tone } = STATUS_CONFIG[report.status];
  const locationParts = [report.site, report.workArea].filter(Boolean);
  return (
    <PressableCard
      label={`${report.categoryLabel}, ${report.reference}`}
      onPress={onPress}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardMain}>
          <Text style={styles.cardMeta}>{report.reference}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {report.categoryLabel}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={2}>
            {locationParts.join(' · ')}
          </Text>
          <Text style={styles.cardMeta}>{formatDate(report.submittedAt)}</Text>
          <View style={styles.cardBadge}>
            <StatusBadge label={label} tone={tone} />
          </View>
        </View>
        {report.evidenceUri ? (
          <Image
            source={{ uri: report.evidenceUri }}
            style={styles.thumbnail}
            accessibilityLabel="Report photo"
          />
        ) : null}
      </View>
    </PressableCard>
  );
}

export default function MyReportsScreen() {
  const router = useRouter();
  const { state } = useReporting();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [hoveredFilter, setHoveredFilter] = useState<FilterKey | null>(null);
  const [focusedFilter, setFocusedFilter] = useState<FilterKey | null>(null);

  const filtered = state.demoReports.filter((r) => {
    if (filter === 'active') return ACTIVE_STATUSES.includes(r.status);
    if (filter === 'resolved')
      return r.status === 'resolved' || r.status === 'closed';
    return true;
  });

  // Sort newest first
  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  return (
    <View style={styles.content}>
      <SectionHeader
        title="My reports"
        description="Reports you have submitted at this site."
      />

      {/* Filter tabs */}
      <View
        style={styles.tabs}
        accessibilityRole="tablist"
        accessibilityLabel="Filter reports"
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            accessibilityRole="tab"
            accessibilityLabel={f.label}
            accessibilityState={{ selected: filter === f.key }}
            onPress={() => setFilter(f.key)}
            onHoverIn={() => setHoveredFilter(f.key)}
            onHoverOut={() => setHoveredFilter(null)}
            onFocus={() => setFocusedFilter(f.key)}
            onBlur={() => setFocusedFilter(null)}
            style={({ pressed }) => [
              styles.tab,
              hoveredFilter === f.key && filter !== f.key && styles.tabHover,
              filter === f.key && styles.tabActive,
              pressed && styles.tabPressed,
              focusedFilter === f.key && styles.tabFocused,
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                filter === f.key && styles.tabLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {sorted.length === 0 ? (
        <EmptyState
          title="No reports here"
          description={
            filter === 'active'
              ? 'You have no active reports.'
              : filter === 'resolved'
                ? 'No resolved reports yet.'
                : 'You have not submitted any reports yet.'
          }
        />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.reference}
          renderItem={({ item }) => (
            <ReportCard
              report={item}
              onPress={() => router.push(`/reports/${item.reference}`)}
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
  tabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.coolSurface,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.graphite,
  },
  tabHover: { backgroundColor: colors.coolConcrete },
  tabPressed: { backgroundColor: colors.coolConcrete },
  tabFocused: { borderWidth: 2, borderColor: colors.deepCharcoal },
  tabLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.graphite,
  },
  tabLabelActive: { color: colors.deepCharcoal, fontWeight: '700' },
  list: { gap: spacing[2] },
  cardRow: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'flex-start',
  },
  cardMain: { flex: 1, gap: 3, minWidth: 0 },
  cardTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardMeta: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  cardBadge: { marginTop: spacing[1] },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.coolSurface,
    flexShrink: 0,
  },
});
