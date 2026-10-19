import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import {
  colors,
  spacing,
  typography,
  type IllustrationKey,
} from '@safira/design-tokens';
import NotePencil from 'phosphor-react-native/src/icons/NotePencil';
import ClockCounterClockwise from 'phosphor-react-native/src/icons/ClockCounterClockwise';
import Bell from 'phosphor-react-native/src/icons/Bell';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AuthShell, SafetyGuidance } from '@/components/ui/auth-shell';
import { Button, IllustrationSlot } from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';

const steps: readonly {
  title: string;
  description: string;
  illustration?: IllustrationKey;
  points?: readonly { title: string; body: string }[];
}[] = [
  {
    title: 'See something? Report it.',
    description:
      'Tell us what happened in plain language. You can add a photo, and HSE can assess the details later.',
    illustration: 'reportCategory',
  },
  {
    title: 'Report. Track. Stay informed.',
    description:
      'Your reports stay in My reports, with updates you can follow.',
    points: [
      { title: 'Report', body: 'Share a safety concern quickly.' },
      { title: 'Track', body: 'See where your report stands.' },
      { title: 'Stay informed', body: 'Read updates intended for workers.' },
    ],
  },
  {
    title: 'Safety checks',
    description:
      'Complete assigned checklists and report an issue when a check reveals one.',
    illustration: 'checklist',
  },
  {
    title: 'Immediate danger comes first',
    description: 'Safira helps record and follow up safety concerns.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { account, session, loading, finishOnboarding } = useAuth();
  const [step, setStep] = useState(0);
  if (loading) return <AuthShell title="Opening Safira" />;
  if (!session || !account) return <Redirect href="/sign-in" />;
  if (!account.profileComplete) return <Redirect href="/complete-profile" />;
  if (account.onboardingComplete) return <Redirect href="/" />;

  const current = steps[step];
  const artworkWidth = Math.min(width - 32, height < 720 ? 340 : 380);
  const lastPointIndex = (current.points?.length ?? 0) - 1;
  function continueFlow() {
    if (step < steps.length - 1) setStep(step + 1);
    else if (finishOnboarding()) router.replace('/');
  }

  return (
    <AuthShell
      title={current.title}
      description={current.description}
      step="Getting started"
      progress={{ current: step + 1, total: steps.length }}
      onboarding
    >
      <View style={styles.content}>
        <View style={styles.stage}>
          {current.illustration && (
            <IllustrationSlot
              illustrationKey={current.illustration}
              decorative
              style={{ maxWidth: artworkWidth }}
            />
          )}
          {current.points?.map((point, index) => (
            <View
              key={point.title}
              style={[
                styles.pointRow,
                index === lastPointIndex && styles.lastPointRow,
              ]}
            >
              <View style={styles.pointIcon} accessibilityElementsHidden>
                {index === 0 ? (
                  <NotePencil
                    size={23}
                    weight="bold"
                    color={colors.deepCharcoal}
                  />
                ) : index === 1 ? (
                  <ClockCounterClockwise
                    size={23}
                    weight="bold"
                    color={colors.deepCharcoal}
                  />
                ) : (
                  <Bell size={23} weight="bold" color={colors.deepCharcoal} />
                )}
              </View>
              <View style={styles.pointCopy}>
                <Text style={styles.pointTitle}>{point.title}</Text>
                <Text style={styles.pointBody}>{point.body}</Text>
              </View>
            </View>
          ))}
          {step === 3 && (
            <SafetyGuidance
              title="Follow site emergency procedures first"
              message="Safira is not an emergency response service. If there is immediate danger, follow your site's emergency procedure before making a report."
            />
          )}
        </View>
        <View style={styles.actions}>
          {step > 0 && (
            <View style={styles.backAction}>
              <Button
                label="Back"
                variant="secondary"
                onPress={() => setStep(step - 1)}
              />
            </View>
          )}
          <View style={styles.primaryAction}>
            <Button
              label={step === steps.length - 1 ? 'Go to Safira' : 'Continue'}
              onPress={continueFlow}
            />
          </View>
        </View>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: spacing[1] },
  stage: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing[1],
    paddingVertical: 4,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 68,
    paddingVertical: spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: colors.coolConcrete,
  },
  lastPointRow: { borderBottomWidth: 0 },
  pointIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.signalYellow,
  },
  pointCopy: { flex: 1, gap: 2 },
  pointTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  pointBody: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[1],
    paddingTop: spacing[1],
    borderTopWidth: 1,
    borderTopColor: colors.coolConcrete,
  },
  backAction: { width: 104 },
  primaryAction: { flex: 1 },
});
