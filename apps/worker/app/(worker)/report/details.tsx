import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import CalendarBlank from 'phosphor-react-native/src/icons/CalendarBlank';
import Clock from 'phosphor-react-native/src/icons/Clock';
import MapPin from 'phosphor-react-native/src/icons/MapPin';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  ChoiceCard,
  DateTimeField,
  SelectField,
  SelectionSheet,
  TextArea,
  WorkerHeader,
} from '@/components/ui';
import { workerHomeDemo } from '@/demo/worker-data';
import { useReporting } from '@/reporting/provider';

export default function EvidenceDetailsScreen() {
  const router = useRouter();
  const { state, updateDraft } = useReporting();
  const draft = state.draft;
  const [attempted, setAttempted] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [workAreaTouched, setWorkAreaTouched] = useState(false);
  const [workAreasOpen, setWorkAreasOpen] = useState(false);
  const [shownAt] = useState(() => new Date());
  const selectedArea = workerHomeDemo.workAreas.find(
    (area) => area.id === draft.workAreaId,
  );
  const dateLabel = `Today, ${shownAt.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
  const timeLabel = shownAt.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const descriptionInvalid = !draft.description.trim();
  const workAreaInvalid = !draft.workAreaId;
  const showDescriptionError =
    (attempted || descriptionTouched) && descriptionInvalid;
  const showWorkAreaError = (attempted || workAreaTouched) && workAreaInvalid;

  function closeWorkAreaPicker() {
    setWorkAreaTouched(true);
    setWorkAreasOpen(false);
  }

  function continueToEvidence() {
    setAttempted(true);
    if (descriptionInvalid || workAreaInvalid) return;
    router.push('/report/evidence');
  }

  return (
    <View style={styles.content}>
      <WorkerHeader
        backLabel="Back to report choices"
        onBack={() => router.replace('/report')}
        context={workerHomeDemo.site.name}
        inset
      />

      <View style={styles.form}>
        <View style={styles.progress} accessibilityLabel="Report details step">
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.title}>Tell us what happened</Text>
          <Text style={styles.guidance}>
            Provide as much detail as you can. You don&apos;t need to use
            technical terms.
          </Text>
        </View>

        <TextArea
          label="What happened?"
          placeholder="Describe what you noticed"
          value={draft.description}
          onChangeText={(description) => updateDraft({ description })}
          onBlur={() => setDescriptionTouched(true)}
          numberOfLines={3}
          maxLength={2000}
          error={
            showDescriptionError ? 'Please add a short description.' : undefined
          }
        />

        <View style={styles.fieldGroup}>
          <SelectField
            label="Where did this happen?"
            value={selectedArea?.name}
            placeholder="Choose a work area"
            leadingIcon={<MapPin size={19} color={colors.graphite} />}
            expanded={workAreasOpen}
            error={showWorkAreaError ? 'Choose a work area.' : undefined}
            onPress={() => setWorkAreasOpen((open) => !open)}
          />
          <View
            style={styles.siteField}
            accessibilityLabel={`Current site, ${workerHomeDemo.site.name}`}
          >
            <MapPin size={19} color={colors.graphite} />
            <Text style={styles.siteText}>{workerHomeDemo.site.name}</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>When did this happen?</Text>
          <View style={styles.dateTimeRow}>
            <DateTimeField
              style={styles.dateField}
              accessibilityLabel={`Current date, ${dateLabel}`}
              icon={<CalendarBlank size={19} color={colors.graphite} />}
              value={dateLabel}
            />
            <DateTimeField
              style={styles.timeField}
              accessibilityLabel={`Current time, ${timeLabel}`}
              icon={<Clock size={19} color={colors.graphite} />}
              value={timeLabel}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerAction}>
            <Button label="Next" onPress={continueToEvidence} />
          </View>
        </View>
      </View>
      <SelectionSheet
        visible={workAreasOpen}
        title="Where did this happen?"
        onClose={closeWorkAreaPicker}
      >
        {workerHomeDemo.workAreas.map((area) => (
          <ChoiceCard
            key={area.id}
            accessibilityLabel={area.name}
            title={area.name}
            selected={draft.workAreaId === area.id}
            onPress={() => {
              updateDraft({ workAreaId: area.id });
              setWorkAreasOpen(false);
            }}
          />
        ))}
      </SelectionSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    marginHorizontal: -spacing[2],
    marginTop: -spacing[2],
    backgroundColor: colors.white,
  },
  form: {
    flexGrow: 1,
    gap: spacing[2],
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[2],
  },
  progress: { flexDirection: 'row', gap: 4 },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.coolConcrete,
  },
  progressActive: { backgroundColor: colors.signalYellow },
  intro: { gap: spacing[1] },
  title: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  guidance: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  fieldGroup: { gap: spacing[1] },
  fieldLabel: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  siteField: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[1],
    backgroundColor: colors.coolSurface,
  },
  siteText: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
  dateTimeRow: { flexDirection: 'row', gap: spacing[1] },
  dateField: { flex: 2 },
  timeField: { flex: 1 },
  footer: { flexDirection: 'row', gap: spacing[1], marginTop: 'auto' },
  footerAction: { flex: 1 },
});
