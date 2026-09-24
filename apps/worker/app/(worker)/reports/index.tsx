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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${report.categoryLabel}, ${report.reference}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardMain}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {report.categoryLabel}
          </Text>
          <Text style={styles.cardMeta}>{report.reference}</Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
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
    </Pressable>
  );
}

export default function MyReportsScreen() {
  const router = useRouter();
  const { state } = useReporting();
  const [filter, setFilter] = useState<FilterKey>('all');

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
            style={[styles.tab, filter === f.key && styles.tabActive]}
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
    borderColor: colors.graphite,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  tabActive: { backgroundColor: colors.graphite },
  tabLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.graphite,
  },
  tabLabelActive: { color: colors.white },
  list: { gap: spacing[2] },
  card: {
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing[2],
  },
  cardPressed: { opacity: 0.8 },
  cardRow: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'flex-start',
  },
  cardMain: { flex: 1, gap: spacing[1] },
  cardTitle: {
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
    lineHeight: 18,
  },
  cardBadge: { marginTop: spacing[1] },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.warmBone,
    flexShrink: 0,
  },
});
