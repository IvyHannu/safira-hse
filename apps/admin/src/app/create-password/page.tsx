'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { workerActivationSchema } from '@safira/validation';
import { useForm } from 'react-hook-form';
import { AccountFlowShell } from '@/components/ui/account-flow-shell';
import { AccountContext } from '@/components/ui/account-context';
import { Button } from '@/components/ui/button';
import { Input, PasswordVisibilityButton } from '@/components/ui/forms';
import { getAdminInvitation } from '@/lib/local-admin-account';
import { useAuth } from '@/lib/demo-auth';

interface PasswordValues {
  password: string;
  confirmPassword: string;
}

export default function CreatePasswordPage() {
  const router = useRouter();
  const code = useSearchParams().get('code');
  const invitation = getAdminInvitation(code);
  const { activate, error } = useAuth();
  const [visible, setVisible] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>();

  if (!invitation)
    return (
      <AccountFlowShell
        context="ACCOUNT SETUP"
        title="Invitation unavailable"
        description="Ask your organisation for a current Safira invitation link."
        phase="Account setup"
        step={1}
        totalSteps={3}
        actions={
          <Button onClick={() => router.replace('/sign-in')}>Sign in</Button>
        }
      >
        <p className="text-sm text-graphite">
          This invitation link is not available.
        </p>
      </AccountFlowShell>
    );

  async function continueSetup(values: PasswordValues) {
    const parsed = workerActivationSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'password' || field === 'confirmPassword')
          setError(field, { message: issue.message });
      }
      return;
    }
    if (await activate(code!, values.password))
      router.replace('/complete-profile');
  }

  return (
    <AccountFlowShell
      context={invitation.role.replaceAll('_', ' ').toUpperCase()}
      title="Create your password"
      description="Use a password you’ll remember for returning to Safira."
      phase="Account setup"
      step={1}
      totalSteps={3}
      actions={
        <Button type="submit" form="admin-password-form" loading={isSubmitting}>
          Continue
        </Button>
      }
    >
      <form
        id="admin-password-form"
        className="grid gap-2"
        onSubmit={(event) => void handleSubmit(continueSetup)(event)}
      >
        <Input label="Email" value={invitation.email} readOnly />
        <Input
          label="Password"
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          error={errors.password?.message}
          endAdornment={
            <PasswordVisibilityButton
              visible={visible}
              onToggle={() => setVisible(!visible)}
            />
          }
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <p className="-mt-0.5 text-xs text-graphite">
          At least 8 characters, including a letter and a number.
        </p>
        <AccountContext
          role={invitation.role}
          organisation={invitation.organisation}
          site={'site' in invitation ? invitation.site : undefined}
        />
        {error && (
          <p role="alert" className="text-sm text-critical">
            {error}
          </p>
        )}
      </form>
    </AccountFlowShell>
  );
}
