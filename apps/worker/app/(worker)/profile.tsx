import { Link, useRouter } from 'expo-router';
import type { AuthRole } from '@safira/auth';
import { colors, spacing, typography } from '@safira/design-tokens';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  InlineAlert,
  SectionHeader,
  SelectableCard,
} from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';

const roles: { value: AuthRole; label: string }[] = [
  { value: 'worker', label: 'Worker' },
  { value: 'hse_officer', label: 'HSE Officer' },
  { value: 'hse_admin', label: 'HSE Admin' },
  { value: 'organisation_admin', label: 'Organisation Admin' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { session, loading, error, signIn, signOut } = useAuth();
  const activeLabel = roles.find((role) => role.value === session?.role)?.label;

  return (
    <View style={styles.content}>
      <SectionHeader
        title="Demo access"
        description="Choose a local role to test Safira. The Worker home is available with the Worker role."
      />
      {loading ? (
        <Text style={styles.body}>Restoring demo session…</Text>
      ) : (
        <>
          <Text style={styles.activeRole} accessibilityRole="text">
            {activeLabel ? `Selected role: ${activeLabel}` : 'No role selected'}
          </Text>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Demo roles"
            style={styles.roles}
          >
            {roles.map(({ value, label }) => (
              <SelectableCard
                key={value}
                title={label}
                selected={session?.role === value}
                onPress={() => void signIn(value)}
              />
            ))}
          </View>
          {session?.role === 'worker' && (
            <Button label="Go to Home" onPress={() => router.replace('/')} />
          )}
          {session && (
            <Button
              label="Sign out"
              variant="tertiary"
              onPress={() => void signOut()}
            />
          )}
        </>
      )}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      <InlineAlert
        tone="information"
        title="Prototype access only"
        message="This role is stored on this device. It does not grant database access."
      />
      {__DEV__ && (
        <Link href="/design-system" asChild>
          <Pressable accessibilityRole="link" style={styles.showcaseLink}>
            <Text style={styles.linkText}>Open design system showcase</Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  roles: { gap: spacing[1] },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
  activeRole: {
    color: colors.softBlack,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: colors.critical,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
  },
  showcaseLink: { minHeight: 48, justifyContent: 'center' },
  linkText: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    textDecorationLine: 'underline',
  },
});
