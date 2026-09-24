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

export default function WorkerLayout() {
  return (
    <ReportingProvider>
      <WorkerShell />
    </ReportingProvider>
  );
}

function WorkerShell() {
  const { ready, storageError } = useReporting();
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <ScreenContainer bottomNavigation={<WorkerNavigation />}>
      {!ready || loading ? (
        <Text
          style={{ color: colors.graphite, fontFamily: typography.fontFamily }}
        >
          Loading saved report…
        </Text>
      ) : pathname.startsWith('/report') && session?.role !== 'worker' ? (
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
