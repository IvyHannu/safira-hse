'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountFlowShell } from '@/components/ui/account-flow-shell';
import { Button } from '@/components/ui/button';
import { OnboardingStepContent } from '@/components/ui/onboarding-step-content';
import { useAuth } from '@/lib/demo-auth';
import { completeOrganisationAdminOnboarding } from '@/lib/organisation-admin-onboarding';

const steps = [
  {
    title: 'Set up your organisation',
    description: 'Keep your organisation structure clear in Safira.',
    points: [
      'Manage organisation-level details and structure.',
      'Define how people and locations are organised.',
      'Keep governance separate from HSE operations.',
    ],
    illustrationKey: null,
  },
  {
    title: 'People and roles',
    description: 'Give people the access they need for their responsibilities.',
    points: [
      'Invite members and assign roles.',
      'Manage active and inactive access.',
      'Keep each role’s responsibility clear.',
    ],
    illustrationKey: null,
  },
  {
    title: 'Sites and access',
    description: 'Organise where people work and what they can access.',
    points: [
      'Add sites and work areas.',
      'Control member access to sites.',
      'Review invitations and access requests.',
    ],
    illustrationKey: 'siteWorkplace',
  },
  {
    title: 'You’re ready to begin',
    description: 'Keep people, sites and organisation access up to date.',
    points: [
      'Start with invitations or access items needing attention.',
      'Use your organisation workspace for ongoing governance.',
    ],
    illustrationKey: null,
  },
] as const;

export function OrganisationAdminOnboardingFlow({
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
      router.replace('/organisation-admin/overview');
      return;
    }
    if (!session || !completeOrganisationAdminOnboarding(session)) {
      setSaveError(
        'Could not save your progress on this device. Please try again.',
      );
      return;
    }
    router.replace('/organisation-admin/overview');
  }

  return (
    <AccountFlowShell
      context="ORGANISATION ADMIN"
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
            {stepIndex === steps.length - 1
              ? 'Open Organisation Admin'
              : 'Continue'}
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
