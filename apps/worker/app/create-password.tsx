import { useLocalSearchParams, useRouter } from 'expo-router';
import { workerActivationSchema } from '@safira/validation';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { getInvitation } from '@/auth/local-account';
import {
  AuthShell,
  AuthTextLink,
  PasswordField,
  authStyles,
} from '@/components/ui/auth-shell';
import { Button, FormField, ValidationMessage } from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';

interface PasswordValues {
  password: string;
  confirmPassword: string;
}

export default function CreatePasswordScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const invitation = getInvitation(code);
  const { activate, error } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!invitation)
    return (
      <AuthShell title="Invitation unavailable">
        <AuthTextLink
          label="Sign in"
          onPress={() => router.replace('/sign-in')}
        />
      </AuthShell>
    );

  async function continueSetup(values: PasswordValues) {
    const result = workerActivationSchema.safeParse(values);
    if (!result.success) {
      const invalidFields = new Set<string>();
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          (field === 'password' || field === 'confirmPassword') &&
          !invalidFields.has(field)
        ) {
          setError(field, { message: issue.message });
          invalidFields.add(field);
        }
      }
      return;
    }
    if (await activate(code!, values.password))
      router.replace('/complete-profile');
  }

  return (
    <AuthShell
      title="Create your password"
      description="Use a password you’ll remember for returning to Safira."
      step="Account setup"
      progress={{ current: 1, total: 3 }}
    >
      <View style={authStyles.stack}>
        <FormField label="Email" value={invitation.email} editable={false} />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <PasswordField
              label="Password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
              autoComplete="new-password"
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <PasswordField
              label="Confirm password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
            />
          )}
        />
        <Text style={authStyles.guidance}>
          At least 8 characters, including a letter and a number.
        </Text>
        <ValidationMessage message={error || undefined} />
        <Button
          label="Continue"
          loading={isSubmitting}
          onPress={() => void handleSubmit(continueSetup)()}
        />
      </View>
    </AuthShell>
  );
}
