'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from '@phosphor-icons/react';
import { AccountFlowShell } from '@/components/ui/account-flow-shell';
import { Button } from '@/components/ui/button';
import { IllustrationSlot } from '@/components/ui/illustration-slot';
import { useAuth } from '@/lib/demo-auth';
import { completeHseOfficerOnboarding } from '@/lib/hse-officer-onboarding';

const steps = [
  {
    title: 'Your HSE workspace',
    description:
      'Focus on the reports and safety concerns at the sites you support.',
    points: [
      'Review reports from workers.',
      'Confirm classification and set severity.',
      'See which issues need attention.',
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
      'Review submitted safety checks.',
      'Identify flagged answers and evidence.',
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
      {step.illustrationKey && (
        <IllustrationSlot
          illustrationKey={step.illustrationKey}
          decorative
          size="support"
        />
      )}
      <ul className="divide-y divide-graphite/10">
        {step.points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-3 py-2.5 text-sm leading-5 text-graphite first:pt-0 last:pb-0"
          >
            <CheckCircle
              size={18}
              weight="bold"
              className="mt-0.5 shrink-0 text-deepCharcoal"
              aria-hidden="true"
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      {saveError && (
        <p role="alert" className="text-sm text-critical">
          {saveError}
        </p>
      )}
    </AccountFlowShell>
  );
}
