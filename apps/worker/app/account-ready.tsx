import { Redirect, useRouter } from 'expo-router';
import { View } from 'react-native';
import {
  AccountContext,
  AccountMilestone,
  AuthShell,
  authStyles,
} from '@/components/ui/auth-shell';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';

export default function AccountReadyScreen() {
  const router = useRouter();
  const { account, session, loading } = useAuth();
  if (loading) return <AuthShell title="Opening Safira" />;
  if (!session || !account) return <Redirect href="/sign-in" />;
  if (!account.profileComplete) return <Redirect href="/complete-profile" />;
  if (account.onboardingComplete) return <Redirect href="/" />;
  return (
    <AuthShell
      title="Your account is ready"
      description="A short introduction will show you how Safira helps you report and follow safety concerns."
      step="Account setup"
      progress={{ current: 3, total: 3 }}
    >
      <View style={authStyles.stack}>
        <AccountMilestone
          title="Ready to go"
          message={`Welcome, ${account.fullName}. Your Worker access is set up.`}
        />
        <AccountContext
          organisation={account.organisation}
          site={account.site}
        />
        <Button
          label="Continue to introduction"
          onPress={() => router.replace('/onboarding')}
        />
      </View>
    </AuthShell>
  );
}
