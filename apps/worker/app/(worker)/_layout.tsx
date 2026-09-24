import { Slot, usePathname, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { colors, typography } from '@safira/design-tokens';
import {
  Button,
  EmptyState,
  InlineAlert,
  ScreenContainer,
} from '@/components/ui';
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
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const storageError = reportingStorageError || safetyStorageError;
  const isReady = reportingReady && safetyReady;

  return (
    <ScreenContainer bottomNavigation={<WorkerNavigation />}>
      {!isReady || loading ? (
        <Text
          style={{ color: colors.graphite, fontFamily: typography.fontFamily }}
        >
          Loading your session…
        </Text>
      ) : (pathname.startsWith('/report') ||
          pathname.startsWith('/reports') ||
          pathname.startsWith('/safety')) &&
        session?.role !== 'worker' ? (
        <EmptyState
          title="Choose the Worker demo role"
          description="Open Profile to continue with this prototype."
          action={
            <Button
              label="Open Profile"
              onPress={() => router.push('/profile')}
            />
          }
        />
      ) : (
        <>
          {storageError && (
            <InlineAlert
              tone="critical"
              title="Local save issue"
              message={storageError}
            />
          )}
          <Slot />
        </>
      )}
    </ScreenContainer>
  );
}
