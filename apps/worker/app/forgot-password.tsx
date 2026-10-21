import { useState } from 'react';
import { useRouter } from 'expo-router';
import { workerSignInSchema } from '@safira/validation';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import {
  AuthShell,
  AuthTextLink,
  authStyles,
} from '@/components/ui/auth-shell';
import { Button, FormField, InfoCard } from '@/components/ui';

interface ForgotValues {
  email: string;
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [requested, setRequested] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotValues>({ defaultValues: { email: '' } });

  function submit(values: ForgotValues) {
    const result = workerSignInSchema.shape.email.safeParse(values.email);
    if (!result.success) {
      setError('email', {
        message:
          result.error.issues[0]?.message || 'Enter a valid email address.',
      });
      return;
    }
    setRequested(true);
  }

  return (
    <AuthShell
      title="Forgot password?"
      description="Enter your account email to see the next step."
    >
      <View style={authStyles.stack}>
        {requested ? (
          <InfoCard message="A password reset email cannot be sent right now. Contact your organisation administrator for help with account access." />
        ) : (
          <>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormField
                  label="Email"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              )}
            />
            <Button
              label="Continue"
              onPress={() => void handleSubmit(submit)()}
            />
          </>
        )}
        <AuthTextLink
          label="Back to sign in"
          onPress={() => router.replace('/sign-in')}
        />
      </View>
    </AuthShell>
  );
}
