import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@safira/design-tokens';
import { getInvitation } from '@/auth/local-account';
import {
  AccountContext,
  AuthShell,
  AuthTextLink,
  authStyles,
} from '@/components/ui/auth-shell';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';

export default function InviteScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { account } = useAuth();
  const invitation = getInvitation(code);

  if (!invitation)
    return (
      <AuthShell
        title="Invitation unavailable"
        description="Ask your organisation for a current Safira invitation link."
      >
        <AuthTextLink
          label="Sign in"
          onPress={() => router.replace('/sign-in')}
        />
      </AuthShell>
    );

  return (
    <AuthShell
      title="You’re invited to join Safira"
      description="Set up your account to report concerns, follow updates and complete safety checks."
    >
      <AccountContext
        organisation={invitation.organisation}
        site={invitation.site}
      />
      <View style={authStyles.stack}>
        <View style={styles.invitedEmail}>
          <Text style={styles.emailLabel}>INVITED EMAIL</Text>
          <Text style={styles.emailValue}>{invitation.email}</Text>
        </View>
        {account?.email === invitation.email ? (
          <Button
            label="Sign in to your account"
            onPress={() => router.replace('/sign-in')}
          />
        ) : (
          <Button
            label="Set up your account"
            onPress={() =>
              router.push({ pathname: '/create-password', params: { code } })
            }
          />
        )}
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  invitedEmail: { gap: 2, paddingVertical: spacing[1] },
  emailLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  emailValue: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
});
