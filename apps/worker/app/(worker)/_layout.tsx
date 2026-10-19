import { Redirect, Slot } from 'expo-router';
import { Text } from 'react-native';
import { colors, typography } from '@safira/design-tokens';
import { InlineAlert, ScreenContainer } from '@/components/ui';
import { WorkerNavigation } from '@/components/worker-navigation';
import { useAuth } from '@/lib/demo-auth';
import { ReportingProvider, useReporting } from '@/reporting/provider';
import { SafetyProvider, useSafety } from '@/safety/provider';

export default function WorkerLayout() {
  return (
    <ReportingProvider>
      <SafetyProvider>
        <WorkerShell />
      </SafetyProvider>
    </ReportingProvider>
  );
}

function WorkerShell() {
  const { ready: reportingReady, storageError: reportingStorageError } =
    useReporting();
  const { ready: safetyReady, storageError: safetyStorageError } = useSafety();
  const { account, session, loading } = useAuth();
  const storageError = reportingStorageError || safetyStorageError;

  if (!reportingReady || !safetyReady || loading)
    return (
      <ScreenContainer>
        <Text
          style={{ color: colors.graphite, fontFamily: typography.fontFamily }}
        >
          Loading your session…
        </Text>
      </ScreenContainer>
    );
  if (!session) return <Redirect href="/sign-in" />;
  if (!account?.profileComplete) return <Redirect href="/complete-profile" />;
  if (!account.onboardingComplete) return <Redirect href="/onboarding" />;

  return (
    <ScreenContainer bottomNavigation={<WorkerNavigation />}>
      {storageError && (
        <InlineAlert
          tone="critical"
          title="Local save issue"
          message={storageError}
        />
      )}
      <Slot />
    </ScreenContainer>
  );
}
