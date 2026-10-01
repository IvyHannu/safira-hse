import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import { StyleSheet, Text, View } from 'react-native';
import { ProfilePhotoEditor, WorkerHeader } from '@/components/ui';
import { WorkspaceSelector } from '@/components/workspace-selector';
import { workerHomeDemo } from '@/demo/worker-data';
import { useAuth } from '@/lib/demo-auth';

const sections = {
  'personal-details': 'Personal details',
  accessibility: 'Accessibility',
  language: 'Language',
  'help-support': 'Help & Support',
} as const;

export default function ProfileSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const router = useRouter();
  const { session, loading } = useAuth();
  const title = sections[section as keyof typeof sections];

  if (!loading && session?.role !== 'worker') return <WorkspaceSelector />;

  return (
    <View style={styles.content}>
      <WorkerHeader
        backLabel="Back to Profile"
        onBack={() => router.replace('/profile')}
      />
      <Text style={styles.title}>{title ?? 'Profile'}</Text>
      {loading ? (
        <Text style={styles.body}>Opening your profile…</Text>
      ) : (
        <View style={styles.section}>
          {section === 'personal-details' && (
            <>
              <View style={styles.photoSection}>
                <ProfilePhotoEditor name={workerHomeDemo.worker.firstName} />
                <View style={styles.photoCopy}>
                  <Text style={styles.detailValue}>Profile photo</Text>
                  <Text style={styles.detailLabel}>Saved on this device.</Text>
                </View>
              </View>
              <Detail label="Name" value={workerHomeDemo.worker.firstName} />
              <Detail label="Role" value="Worker" />
              <Detail label="Current site" value={workerHomeDemo.site.name} />
            </>
          )}
          {section === 'accessibility' && (
            <Text style={styles.body}>
              Use your device accessibility settings to adjust text and display
              preferences.
            </Text>
          )}
          {section === 'language' && (
            <Detail label="Current language" value="English" />
          )}
          {section === 'help-support' && (
            <Text style={styles.body}>
              For help using Safira, contact your site HSE team. For immediate
              danger, follow your site emergency procedures first.
            </Text>
          )}
          {!title && (
            <Text style={styles.body}>This profile section was not found.</Text>
          )}
        </View>
      )}
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[2], paddingBottom: spacing[3] },
  title: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: spacing[2],
    gap: spacing[2],
  },
  detail: { gap: 4 },
  photoSection: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  photoCopy: { flex: 1, gap: 4 },
  detailLabel: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
  detailValue: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
});
