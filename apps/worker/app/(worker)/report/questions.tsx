import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';
import { Button, SectionHeader, SelectableCard } from '@/components/ui';
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
  const [attempted, setAttempted] = useState(false);
  const answers = state.draft.answers;

  function answer(key: QuestionKey, value: QuestionAnswer) {
    updateDraft({ answers: { ...answers, [key]: value } });
  }

  function continueToReview() {
    setAttempted(true);
    if (Object.values(answers).some((value) => value === null)) return;
    router.push('/report/review');
  }

  return (
    <View style={styles.content}>
      <Button
        label="Back to details"
        variant="tertiary"
        onPress={() => router.replace('/report/details')}
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
            <SelectableCard
              key={choice.value}
              title={choice.label}
              selected={answers[question.key] === choice.value}
              onPress={() => answer(question.key, choice.value)}
            />
          ))}
          {attempted && answers[question.key] === null && (
            <Text style={styles.error}>Choose Yes, No, or Not sure.</Text>
          )}
        </View>
      ))}
      <Button label="Continue to review" onPress={continueToReview} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  question: { gap: spacing[1] },
  label: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: colors.critical,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
});
