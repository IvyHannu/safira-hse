import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import type { ReportStatus } from '@safira/types';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import {
  EmptyState,
  FilterTabs,
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

      <FilterTabs
        items={FILTERS}
        selectedKey={filter}
        onSelect={(key: FilterKey) => setFilter(key)}
        accessibilityLabel="Filter reports"
      />

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
  list: { gap: spacing[2], paddingTop: spacing[1] },
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
