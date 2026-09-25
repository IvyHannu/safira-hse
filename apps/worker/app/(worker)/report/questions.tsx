import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  ChoiceCard,
  SectionHeader,
  ValidationMessage,
  WorkerHeader,
} from '@/components/ui';
import { workerHomeDemo } from '@/demo/worker-data';
import { useReporting } from '@/reporting/provider';
import type { QuestionAnswer, QuestionKey } from '@/reporting/model';

const questions: readonly { key: QuestionKey; label: string }[] = [
  { key: 'anyoneHurt', label: 'Was anyone hurt?' },
  { key: 'anythingDamaged', label: 'Was anything damaged?' },
  { key: 'environmentalImpact', label: 'Could the environment be affected?' },
];

const choices: readonly { value: QuestionAnswer; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure' },
];

export default function AdditionalQuestionsScreen() {
  const router = useRouter();
  const { state, updateDraft } = useReporting();
  const [attemptedFor, setAttemptedFor] = useState<string | null>(null);
  const answers = state.draft.answers;
  const draftCycle = `${state.submitted?.reference ?? 'first'}:${state.draft.source?.type ?? 'direct'}:${state.draft.source?.itemId ?? ''}`;
  const attempted = attemptedFor === draftCycle;

  function answer(key: QuestionKey, value: QuestionAnswer) {
    updateDraft({ answers: { ...answers, [key]: value } });
  }

  function continueToReview() {
    setAttemptedFor(draftCycle);
    if (Object.values(answers).some((value) => value === null)) return;
    router.push('/report/review');
  }

  return (
    <View style={styles.content}>
      <WorkerHeader
        backLabel="Back to details"
        onBack={() => router.replace('/report/details')}
        context={workerHomeDemo.site.name}
      />
      <SectionHeader
        title="A few more questions"
        description="Answer what you know. Not sure is okay."
      />
      {questions.map((question) => (
        <View
          key={question.key}
          style={styles.question}
          accessibilityRole="radiogroup"
          accessibilityLabel={question.label}
        >
          <Text style={styles.label}>{question.label}</Text>
          {choices.map((choice) => (
            <ChoiceCard
              key={choice.value}
              title={choice.label}
              selected={answers[question.key] === choice.value}
              onPress={() => answer(question.key, choice.value)}
            />
          ))}
          <ValidationMessage
            message={
              attempted && answers[question.key] === null
                ? 'Choose Yes, No, or Not sure.'
                : undefined
            }
          />
        </View>
      ))}
      <Button label="Continue to review" onPress={continueToReview} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  question: { gap: spacing[1], maxWidth: 520 },
  label: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
  },
});
