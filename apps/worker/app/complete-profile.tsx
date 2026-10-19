import { Redirect, useRouter } from 'expo-router';
import { workerProfileSchema } from '@safira/validation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import {
  AccountContext,
  AuthShell,
  authStyles,
} from '@/components/ui/auth-shell';
import {
  Button,
  FormField,
  ProfilePhotoEditor,
  ValidationMessage,
} from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';

interface ProfileValues {
  fullName: string;
  jobTitle: string;
}

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { account, session, loading, completeProfile, error } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileValues>({
    defaultValues: {
      fullName: account?.fullName || '',
      jobTitle: account?.jobTitle || '',
    },
  });
  const name = useWatch({ control, name: 'fullName' });

  if (loading) return <AuthShell title="Opening Safira" />;
  if (!session || !account) return <Redirect href="/sign-in" />;
  if (account.profileComplete)
    return (
      <Redirect href={account.onboardingComplete ? '/' : '/account-ready'} />
    );

  function continueSetup(values: ProfileValues) {
    const result = workerProfileSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'fullName' || field === 'jobTitle')
          setError(field, { message: issue.message });
      }
      return;
    }
    if (completeProfile(result.data.fullName, result.data.jobTitle))
      router.replace('/account-ready');
  }

  return (
    <AuthShell
      title="Complete your profile"
      description="Add your name so your reports and safety checks are easy to recognise."
      step="Account setup"
      progress={{ current: 2, total: 3 }}
    >
      <View style={authStyles.stack}>
        <ProfilePhotoEditor name={name || 'Worker'} />
        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <FormField
              label="Full name"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.fullName?.message}
              autoComplete="name"
            />
          )}
        />
        <Controller
          control={control}
          name="jobTitle"
          render={({ field }) => (
            <FormField
              label="Job title (optional)"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.jobTitle?.message}
            />
          )}
        />
        <AccountContext
          organisation={account.organisation}
          site={account.site}
        />
        <ValidationMessage message={error || undefined} />
        <Button
          label="Continue"
          onPress={() => void handleSubmit(continueSetup)()}
        />
      </View>
    </AuthShell>
  );
}
