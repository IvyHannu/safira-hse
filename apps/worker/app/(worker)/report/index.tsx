import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import FirstAid from 'phosphor-react-native/src/icons/FirstAid';
import Leaf from 'phosphor-react-native/src/icons/Leaf';
import ListDashes from 'phosphor-react-native/src/icons/ListDashes';
import Warning from 'phosphor-react-native/src/icons/Warning';
import WarningCircle from 'phosphor-react-native/src/icons/WarningCircle';
import { StyleSheet, Text, View } from 'react-native';
import { Button, ChoiceCard, EmptyState, WorkerHeader } from '@/components/ui';
import {
  workerHomeDemo,
  workerReportCategories,
  type WorkerReportCategoryValue,
} from '@/demo/worker-data';
import { useAuth } from '@/lib/demo-auth';
import { useReporting } from '@/reporting/provider';

// These accents identify worker-facing choices only; they do not represent severity.
const categoryAccents: Record<
  WorkerReportCategoryValue,
  { tile: string; border: string }
> = {
  unsafe_observation: { tile: colors.signalYellow, border: '#9D7400' },
  almost_happened: { tile: '#F28B3C', border: '#A95114' },
  event_happened: { tile: '#E8695F', border: '#A93532' },
  environmental_observation: { tile: '#2FA66C', border: '#176B45' },
};

export default function ReportChoiceScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const { state, updateDraft } = useReporting();
  const selected = state.draft.category;
  const icons = [Warning, ListDashes, FirstAid, Leaf];

  if (loading) return <Text style={styles.body}>Opening Safira…</Text>;
  if (session?.role !== 'worker') {
    return (
      <EmptyState
        title="Choose your workspace"
        description="Select Worker to continue."
        action={
          <Button label="Choose workspace" onPress={() => router.push('/')} />
        }
      />
    );
  }

  return (
    <View style={styles.content}>
      <WorkerHeader
        backLabel="Back to Home"
        onBack={() => router.replace('/')}
        context={workerHomeDemo.site.name}
        inset
      />
      <View style={styles.intro}>
        <Text style={styles.title}>What would you like to report?</Text>
        <Text style={styles.description}>
          Choose the option that best describes what you’ve seen.
        </Text>
      </View>
      <View style={styles.alertWrap}>
        <View accessibilityRole="alert" style={styles.emergencyNotice}>
          <View style={styles.emergencyIcon} accessibilityElementsHidden>
            <WarningCircle size={22} color={colors.critical} weight="bold" />
          </View>
          <View style={styles.emergencyCopy}>
            <Text style={styles.emergencyTitle}>Immediate danger?</Text>
            <Text style={styles.emergencyMessage}>
              Follow your site&apos;s emergency procedure first. Use Safira only
              when it is safe.
            </Text>
          </View>
        </View>
      </View>
      <View
        style={styles.choices}
        accessibilityRole="radiogroup"
        accessibilityLabel="What would you like to report?"
      >
        {workerReportCategories.map((category, index) => {
          const Icon = icons[index];
          const isSelected = selected === category.value;
          const accent = categoryAccents[category.value];
          return (
            <ChoiceCard
              key={category.value}
              accessibilityLabel={`${category.label}. ${category.description}`}
              title={category.label}
              description={category.description}
              selected={isSelected}
              onPress={() => updateDraft({ category: category.value })}
              style={styles.choice}
              leading={
                <View
                  style={[styles.iconSlot, { backgroundColor: accent.tile }]}
                  accessibilityElementsHidden
                >
                  <Icon size={28} color={colors.graphite} weight="regular" />
                </View>
              }
            />
          );
        })}
      </View>
      <View style={styles.footer}>
        <Button
          label="Continue"
          disabled={!selected}
          onPress={() => router.push('/report/details')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing[2],
    marginHorizontal: -spacing[2],
    marginTop: -spacing[2],
    paddingBottom: spacing[2],
    backgroundColor: colors.white,
  },
  intro: { gap: spacing[1], paddingHorizontal: spacing[2] },
  title: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
  },
  description: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  alertWrap: { paddingHorizontal: spacing[2] },
  emergencyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[1],
    padding: spacing[1],
    backgroundColor: `${colors.critical}0D`,
  },
  emergencyIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.critical}14`,
  },
  emergencyCopy: { flex: 1, gap: 2 },
  emergencyTitle: {
    color: colors.critical,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  emergencyMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  choices: { gap: spacing[1], paddingHorizontal: spacing[2] },
  choice: {
    minHeight: 72,
    padding: spacing[1],
  },
  iconSlot: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  footer: { marginTop: 'auto', paddingHorizontal: spacing[2] },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
});
