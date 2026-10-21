'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, SlidersHorizontal } from '@phosphor-icons/react';
import { AccountFlowShell } from '@/components/ui/account-flow-shell';
import { Button } from '@/components/ui/button';
import { OnboardingStepContent } from '@/components/ui/onboarding-step-content';
import { useAuth } from '@/lib/demo-auth';
import { completeHseAdminOnboarding } from '@/lib/hse-admin-onboarding';

const steps = [
  {
    title: 'Manage the HSE system',
    description: 'Keep HSE work visible across the sites you support.',
    points: [
      'Oversee reporting activity.',
      'Review trends across sites.',
      'Support HSE operations beyond individual reports.',
    ],
    illustrationKey: 'reportCategory',
    icon: null,
  },
  {
    title: 'Configure reporting',
    description: 'Keep frontline reporting clear and relevant.',
    points: [
      'Manage reporting categories and settings.',
      'Control where reporting is available.',
      'Keep worker reporting aligned with organisational needs.',
    ],
    illustrationKey: null,
    icon: 'configuration',
  },
  {
    title: 'Manage safety checks',
    description: 'Support consistent safety checks across sites.',
    points: [
      'Create and maintain checklist templates.',
      'Review checklist activity.',
      'Follow up on flagged issues.',
    ],
    illustrationKey: 'checklist',
    icon: null,
  },
  {
    title: 'You’re ready to begin',
    description: 'Use your HSE workspace to guide reporting and follow-up.',
    points: [
      'Start with work that needs attention.',
      'Keep reporting and safety checks useful for every site.',
    ],
    illustrationKey: null,
    icon: 'ready',
  },
] as const;

export function HseAdminOnboardingFlow({
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
      router.replace('/hse-admin/overview');
      return;
    }
    if (!session || !completeHseAdminOnboarding(session)) {
      setSaveError(
        'Could not save your progress on this device. Please try again.',
      );
      return;
    }
    router.replace('/hse-admin/overview');
  }

  return (
    <AccountFlowShell
      context="HSE ADMIN"
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
            {stepIndex === steps.length - 1 ? 'Open HSE Admin' : 'Continue'}
          </Button>
        </>
      }
    >
      <OnboardingStepContent
        points={step.points}
        illustrationKey={step.illustrationKey}
        leading={
          step.icon ? (
            <span
              className={`flex size-10 items-center justify-center rounded-md ${step.icon === 'ready' ? 'bg-signalYellow' : 'border border-coolConcrete bg-coolSurface'}`}
              aria-hidden="true"
            >
              {step.icon === 'ready' ? (
                <CheckCircle size={24} weight="bold" />
              ) : (
                <SlidersHorizontal size={24} weight="bold" />
              )}
            </span>
          ) : undefined
        }
      />
      {saveError && (
        <p role="alert" className="text-sm text-critical">
          {saveError}
        </p>
      )}
    </AccountFlowShell>
  );
}
