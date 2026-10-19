'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from '@phosphor-icons/react';
import { AccountFlowShell } from '@/components/ui/account-flow-shell';
import { Button } from '@/components/ui/button';
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
  },
  {
    title: 'People and roles',
    description: 'Give people the access they need for their responsibilities.',
    points: [
      'Invite members and assign roles.',
      'Manage active and inactive access.',
      'Keep each role’s responsibility clear.',
    ],
  },
  {
    title: 'Sites and access',
    description: 'Organise where people work and what they can access.',
    points: [
      'Add sites and work areas.',
      'Control member access to sites.',
      'Review invitations and access requests.',
    ],
  },
  {
    title: 'You’re ready to begin',
    description: 'Keep people, sites and organisation access up to date.',
    points: [
      'Start with invitations or access items needing attention.',
      'Use your organisation workspace for ongoing governance.',
    ],
  },
] as const;

export default function OrganisationAdminOnboardingPage() {
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
      <ul className="grid gap-3">
        {step.points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-3 text-sm leading-5 text-graphite"
          >
            <CheckCircle
              size={20}
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
