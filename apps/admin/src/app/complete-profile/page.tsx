'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { workerProfileSchema } from '@safira/validation';
import { AccountFlowShell } from '@/components/ui/account-flow-shell';
import { AccountContext } from '@/components/ui/account-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms';
import { ImageEditControl } from '@/components/ui/image-edit-control';
import { ProfileAvatar } from '@/components/ui/profile-settings';
import { useAuth } from '@/lib/demo-auth';

interface ProfileValues {
  fullName: string;
  jobTitle: string;
}

export default function CompleteAdminProfilePage() {
  const router = useRouter();
  const { session, account, loading, completeProfile, error } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileValues>({
    defaultValues: {
      fullName: account?.fullName ?? '',
      jobTitle: account?.jobTitle ?? '',
    },
  });
  const fullName = useWatch({ control, name: 'fullName' });

  useEffect(() => {
    if (loading) return;
    if (!session || !account) router.replace('/sign-in');
    else if (account.profileComplete) router.replace('/account-ready');
  }, [account, loading, router, session]);

  function continueSetup(values: ProfileValues) {
    const parsed = workerProfileSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'fullName' || field === 'jobTitle')
          setError(field, { message: issue.message });
      }
      return;
    }
    if (completeProfile(parsed.data.fullName, parsed.data.jobTitle, photoUrl))
      router.replace('/account-ready');
  }

  function choosePhoto(file?: File) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  if (!account || !session)
    return <main className="min-h-dvh bg-coolSurface" />;

  return (
    <AccountFlowShell
      context={account.role.replaceAll('_', ' ').toUpperCase()}
      title="Complete your profile"
      description="Add your name so colleagues can recognise your work in Safira."
      phase="Account setup"
      step={2}
      totalSteps={3}
      actions={
        <Button type="submit" form="admin-profile-form">
          Continue
        </Button>
      }
    >
      <form
        id="admin-profile-form"
        className="grid gap-1.5"
        onSubmit={(event) => void handleSubmit(continueSetup)(event)}
      >
        <div className="flex items-center gap-4">
          <ImageEditControl
            imageLabel={`${fullName || 'Your'} profile photo`}
            editLabel="Add or change profile photo"
            onEdit={() => inputRef.current?.click()}
          >
            <ProfileAvatar
              name={fullName || 'Your profile'}
              photoUrl={photoUrl}
            />
          </ImageEditControl>
          <div className="text-sm text-graphite">Photo optional</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Choose profile photo"
            onChange={(event) => choosePhoto(event.target.files?.[0])}
          />
        </div>
        <Input
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Job title (optional)"
          error={errors.jobTitle?.message}
          {...register('jobTitle')}
        />
        <AccountContext
          role={account.role}
          organisation={account.organisation}
          site={account.site}
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
