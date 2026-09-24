import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  EmptyState,
  InlineAlert,
  SectionHeader,
  SelectableCard,
} from '@/components/ui';
import { workerReportCategories } from '@/demo/worker-data';
import { useAuth } from '@/lib/demo-auth';
import { useReporting } from '@/reporting/provider';

export default function ReportChoiceScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const { state, updateDraft } = useReporting();
  const selected = state.draft.category;

  if (loading)
    return <Text style={styles.body}>Loading your demo session…</Text>;
  if (session?.role !== 'worker') {
    return (
      <EmptyState
        title="Choose the Worker demo role"
        description="Open Profile to continue with this prototype."
        action={
          <Button
            label="Open Profile"
            onPress={() => router.push('/profile')}
          />
        }
      />
    );
  }

  return (
    <View style={styles.content}>
      <Button
        label="Back to Home"
        variant="tertiary"
        onPress={() => router.replace('/')}
      />
      <SectionHeader
        title="What did you notice?"
        description="Pick the option that feels closest to what happened."
      />
      <InlineAlert
        tone="critical"
        title="Immediate danger?"
        message="Follow your site's emergency procedure first. Use Safira only when it is safe."
      />
      <View
        style={styles.choices}
        accessibilityRole="radiogroup"
        accessibilityLabel="What did you notice?"
      >
        {workerReportCategories.map((category) => (
          <SelectableCard
            key={category.value}
            title={category.label}
            description={category.description}
            selected={selected === category.value}
            onPress={() => updateDraft({ category: category.value })}
          />
        ))}
      </View>
      <Button
        label="Continue"
        disabled={!selected}
        onPress={() => router.push('/report/details')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  choices: { gap: spacing[1] },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
});
