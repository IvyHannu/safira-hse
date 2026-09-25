import { useState } from 'react';
import { useRouter } from 'expo-router';
import type { AuthRole } from '@safira/auth';
import { colors, spacing, typography } from '@safira/design-tokens';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Button, ChoiceCard, SectionHeader } from '@/components/ui';
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
  const [routeError, setRouteError] = useState<string | null>(null);
  const activeLabel = roles.find((role) => role.value === session?.role)?.label;

  async function chooseRole(role: AuthRole) {
    setRouteError(null);
    if (!(await signIn(role))) return;
    if (role === 'worker') {
      router.replace('/');
      return;
    }
    const base =
      process.env.EXPO_PUBLIC_ADMIN_DEMO_URL || 'http://localhost:3000';
    try {
      await Linking.openURL(
        `${base.replace(/\/$/, '')}/workspace?demoRole=${role}`,
      );
    } catch {
      setRouteError(
        'Could not open the Admin demo. Your selected role is still saved.',
      );
    }
  }

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <SectionHeader
          title="Choose your space"
          description="Select a demo role to continue."
        />
      </View>
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
              <ChoiceCard
                key={value}
                title={label}
                selected={session?.role === value}
                onPress={() => void chooseRole(value)}
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
      {routeError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {routeError}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3] },
  heading: {
    borderLeftWidth: 4,
    borderLeftColor: colors.signalYellow,
    paddingLeft: spacing[2],
  },
  roles: { gap: spacing[1] },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
  activeRole: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: colors.critical,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
  },
});
