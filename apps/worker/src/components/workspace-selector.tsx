import { useState } from 'react';
import { useRouter } from 'expo-router';
import type { AuthRole } from '@safira/auth';
import { colors, spacing } from '@safira/design-tokens';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { ChoiceCard, SectionHeader, ValidationMessage } from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';

const workspaces: readonly { role: AuthRole; label: string }[] = [
  { role: 'worker', label: 'Worker' },
  { role: 'hse_officer', label: 'HSE Officer' },
  { role: 'hse_admin', label: 'HSE Admin' },
  { role: 'organisation_admin', label: 'Organisation Admin' },
];

export function WorkspaceSelector() {
  const router = useRouter();
  const { session, signIn, error } = useAuth();
  const [routeError, setRouteError] = useState<string | null>(null);

  async function chooseWorkspace(role: AuthRole) {
    setRouteError(null);
    if (!(await signIn(role))) return;
    if (role === 'worker') {
      router.replace('/');
      return;
    }
    const base =
      process.env.EXPO_PUBLIC_ADMIN_DEMO_URL || 'http://localhost:3001';
    try {
      const destination = `${base.replace(/\/$/, '')}/workspace?workspaceRole=${role}`;
      if (Platform.OS === 'web') {
        window.location.assign(destination);
      } else {
        await Linking.openURL(destination);
      }
    } catch {
      setRouteError('Could not open the selected workspace. Try again.');
    }
  }

  return (
    <View style={styles.content}>
      <View style={styles.heading}>
        <SectionHeader
          title="Choose your workspace"
          description="Continue as the role that matches your work."
        />
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Workspaces"
        style={styles.roles}
      >
        {workspaces.map(({ role, label }) => (
          <ChoiceCard
            key={role}
            title={label}
            selected={session?.role === role}
            onPress={() => void chooseWorkspace(role)}
          />
        ))}
      </View>
      <ValidationMessage message={routeError || error || undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[3], maxWidth: 520 },
  heading: {
    borderLeftWidth: 4,
    borderLeftColor: colors.signalYellow,
    paddingLeft: spacing[2],
  },
  roles: { gap: spacing[1] },
});
