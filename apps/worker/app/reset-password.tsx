import { useRouter } from 'expo-router';
import { AuthShell, AuthTextLink } from '@/components/ui/auth-shell';
import { InfoCard } from '@/components/ui';

export default function ResetPasswordScreen() {
  const router = useRouter();
  return (
    <AuthShell
      title="Reset your password"
      description="Password reset links will be available when organisation account services are connected."
    >
      <InfoCard message="This local preview cannot verify a reset link or change an account password. Contact your organisation administrator for access help." />
      <AuthTextLink
        label="Back to sign in"
        onPress={() => router.replace('/sign-in')}
      />
    </AuthShell>
  );
}
