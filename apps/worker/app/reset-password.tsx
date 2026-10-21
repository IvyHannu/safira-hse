import { useRouter } from 'expo-router';
import { AuthShell, AuthTextLink } from '@/components/ui/auth-shell';
import { InfoCard } from '@/components/ui';

export default function ResetPasswordScreen() {
  const router = useRouter();
  return (
    <AuthShell
      title="Reset your password"
      description="Contact your organisation administrator if you need to reset your password."
    >
      <InfoCard message="Password reset links cannot be used right now. Your organisation administrator can help restore access." />
      <AuthTextLink
        label="Back to sign in"
        onPress={() => router.replace('/sign-in')}
      />
    </AuthShell>
  );
}
