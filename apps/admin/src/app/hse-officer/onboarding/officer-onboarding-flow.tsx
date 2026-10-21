'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountFlowShell } from '@/components/ui/account-flow-shell';
import { Button } from '@/components/ui/button';
import { OnboardingStepContent } from '@/components/ui/onboarding-step-content';
import { useAuth } from '@/lib/demo-auth';
import { completeHseOfficerOnboarding } from '@/lib/hse-officer-onboarding';

const steps = [
  {
    title: 'Your HSE workspace',
    description:
      'Focus on the reports and safety concerns at the sites you support.',
    points: [
      'Review worker reports.',
      'Spot issues needing attention.',
      'Confirm classification and severity.',
    ],
    illustrationKey: 'reportCategory',
  },
  {
    title: 'Take action',
    description: 'Keep follow-up clear for both your HSE team and the worker.',
    points: [
      'Record corrective actions and who owns them.',
      'Share updates that workers can see.',
      'Keep internal HSE notes separate.',
      'Resolve a report when the issue is actually complete.',
    ],
    illustrationKey: null,
  },
  {
    title: 'Review safety checks',
    description:
      'Use checklist submissions to spot and follow up on site issues.',
    points: [
      'Review safety check submissions.',
      'Spot flagged answers and evidence.',
      'Follow up where action is needed.',
    ],
    illustrationKey: 'checklist',
  },
  {
    title: 'You’re ready to begin',
    description:
      'Review what has been reported, take practical action and keep people informed.',
    points: [
      'Start with the items needing attention.',
      'Keep worker-facing updates clear and timely.',
    ],
    illustrationKey: null,
  },
] as const;

export function OfficerOnboardingFlow({
  preview = false,
}: {
  preview?: boolean;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const step = steps[stepIndex];

  function continueFlow() {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }
    if (preview) {
      router.replace('/hse-officer/overview');
      return;
    }
    if (!session || !completeHseOfficerOnboarding(session)) {
      setSaveError(
        'Could not save your progress on this device. Please try again.',
      );
      return;
    }
    router.replace('/hse-officer/overview');
  }

  return (
    <AccountFlowShell
      context="HSE OFFICER"
      title={step.title}
      description={step.description}
      step={stepIndex + 1}
      totalSteps={steps.length}
      phase="Getting started"
      presentation="onboarding"
      contentSurface={step.illustrationKey ? 'plain' : 'card'}
      actions={
        <>
          {stepIndex > 0 && (
            <Button
              variant="secondary"
              onClick={() => {
                setSaveError(null);
                setStepIndex(stepIndex - 1);
              }}
            >
              Back
            </Button>
          )}
          <Button onClick={continueFlow}>
            {stepIndex === steps.length - 1 ? 'Open HSE workspace' : 'Continue'}
          </Button>
        </>
      }
    >
      <OnboardingStepContent
        points={step.points}
        illustrationKey={step.illustrationKey}
      />
      {saveError && (
        <p role="alert" className="text-sm text-critical">
          {saveError}
        </p>
      )}
    </AccountFlowShell>
  );
}
