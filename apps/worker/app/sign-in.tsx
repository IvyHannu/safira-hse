import { Redirect, useRouter } from 'expo-router';
import { workerSignInSchema } from '@safira/validation';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@safira/design-tokens';
import {
  AuthShell,
  AuthTextLink,
  PasswordField,
  authStyles,
} from '@/components/ui/auth-shell';
import { Button, FormField, ValidationMessage } from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';
import { previewInvitation } from '@/auth/local-account';

interface SignInValues {
  email: string;
  password: string;
}

export default function SignInScreen() {
  const router = useRouter();
  const { account, session, loading, signIn, error } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ defaultValues: { email: '', password: '' } });

  async function submit(values: SignInValues) {
    const result = workerSignInSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'email' || field === 'password')
          setError(field, { message: issue.message });
      }
      return;
    }
    if (await signIn(result.data.email, result.data.password)) {
      router.replace(
        account?.profileComplete
          ? account.onboardingComplete
            ? '/'
            : '/onboarding'
          : '/complete-profile',
      );
    }
  }

  if (loading) return <AuthShell title="Opening Safira" />;
  if (session && account)
    return (
      <Redirect
        href={
          account.profileComplete
            ? account.onboardingComplete
              ? '/'
              : '/onboarding'
            : '/complete-profile'
        }
      />
    );

  return (
    <AuthShell
      title="Welcome to Safira"
      description="Sign in to report concerns, follow updates and complete safety checks."
      subtleDescription
      step="Sign in"
    >
      <View style={authStyles.stack}>
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
        <View style={styles.passwordGroup}>
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
                autoComplete="current-password"
              />
            )}
          />
          <View style={styles.forgotPassword}>
            <AuthTextLink
              label="Forgot password?"
              align="end"
              onPress={() => router.push('/forgot-password')}
            />
          </View>
        </View>
        <ValidationMessage message={error || undefined} />
        <Button
          label="Sign in"
          loading={isSubmitting}
          onPress={() => void handleSubmit(submit)()}
        />
        <View style={styles.invitationGuidance}>
          <Text style={styles.invitationTitle}>New to Safira?</Text>
          {__DEV__ ? (
            <>
              <Text style={styles.invitationText}>
                Use your invitation to set up your Worker account.
              </Text>
              <Button
                label="Set up your account"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: '/invite',
                    params: { code: previewInvitation.code },
                  })
                }
              />
            </>
          ) : (
            <Text style={styles.invitationText}>
              Open the invitation link sent by your organisation.
            </Text>
          )}
        </View>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  passwordGroup: { gap: 0 },
  forgotPassword: { alignItems: 'flex-end', marginTop: -spacing[1] },
  invitationGuidance: {
    gap: 6,
    marginTop: spacing[1],
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.coolConcrete,
  },
  invitationTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  invitationText: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
});
