import { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import Buildings from 'phosphor-react-native/src/icons/Buildings';
import Globe from 'phosphor-react-native/src/icons/Globe';
import IdentificationCard from 'phosphor-react-native/src/icons/IdentificationCard';
import MapPin from 'phosphor-react-native/src/icons/MapPin';
import Question from 'phosphor-react-native/src/icons/Question';
import TextAa from 'phosphor-react-native/src/icons/TextAa';
import { StyleSheet, Text, View } from 'react-native';
import {
  SettingsRow,
  SignOutButton,
  ProfileAvatar,
  ValidationMessage,
  WorkerHeader,
} from '@/components/ui';
import { WorkspaceSelector } from '@/components/workspace-selector';
import { workerHomeDemo } from '@/demo/worker-data';
import { useAuth } from '@/lib/demo-auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, loading, error, signOut } = useAuth();
  const [switchingWorkspace, setSwitchingWorkspace] = useState(false);

  if (!loading && (!session || session.role !== 'worker'))
    return <WorkspaceSelector />;
  if (switchingWorkspace) {
    return (
      <View style={styles.content}>
        <WorkerHeader
          backLabel="Back to Profile"
          onBack={() => setSwitchingWorkspace(false)}
        />
        <WorkspaceSelector />
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Profile</Text>

      {loading ? (
        <Text style={styles.body}>Opening your profile…</Text>
      ) : (
        <>
          <View style={styles.identity}>
            <ProfileAvatar
              name={workerHomeDemo.worker.firstName}
              photoUri={workerHomeDemo.worker.photoUri}
            />
            <View style={styles.identityCopy}>
              <Text style={styles.name}>{workerHomeDemo.worker.firstName}</Text>
              <Text style={styles.role}>Worker</Text>
              <Text style={styles.identityMeta}>
                {workerHomeDemo.site.name}
              </Text>
            </View>
          </View>

          {session?.role === 'worker' && (
            <>
              <View style={styles.group}>
                <Text style={styles.groupTitle}>Organisation & Site</Text>
                <View style={styles.groupRow}>
                  <View style={styles.rowIcon}>
                    <Buildings size={20} color={colors.graphite} />
                  </View>
                  <View style={styles.groupCopy}>
                    <Text style={styles.rowLabel}>Organisation</Text>
                    <Text style={styles.groupValue}>Not set</Text>
                  </View>
                </View>
                <View style={styles.groupRow}>
                  <View style={styles.rowIcon}>
                    <MapPin size={20} color={colors.graphite} />
                  </View>
                  <View style={styles.groupCopy}>
                    <Text style={styles.rowLabel}>Current site</Text>
                    <Text style={styles.groupValue}>
                      {workerHomeDemo.site.name}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.group}>
                <SettingsRow
                  label="Personal details"
                  icon={
                    <IdentificationCard size={20} color={colors.graphite} />
                  }
                  onPress={() =>
                    router.push({
                      pathname: '/profile/[section]',
                      params: { section: 'personal-details' },
                    })
                  }
                />
                <SettingsRow
                  label="Accessibility"
                  icon={<TextAa size={20} color={colors.graphite} />}
                  onPress={() =>
                    router.push({
                      pathname: '/profile/[section]',
                      params: { section: 'accessibility' },
                    })
                  }
                />
                <SettingsRow
                  label="Language"
                  icon={<Globe size={20} color={colors.graphite} />}
                  detail="English"
                  onPress={() =>
                    router.push({
                      pathname: '/profile/[section]',
                      params: { section: 'language' },
                    })
                  }
                />
              </View>

              <View style={styles.group}>
                <SettingsRow
                  label="Help & Support"
                  icon={<Question size={20} color={colors.graphite} />}
                  onPress={() =>
                    router.push({
                      pathname: '/profile/[section]',
                      params: { section: 'help-support' },
                    })
                  }
                />
              </View>

              <View style={styles.group}>
                <SignOutButton
                  onPress={() => {
                    void signOut().then(() => router.replace('/'));
                  }}
                />
              </View>
            </>
          )}

          <ValidationMessage message={error || undefined} />
          <SettingsRow
            label="Switch workspace"
            secondary
            onPress={() => setSwitchingWorkspace(true)}
          />
        </>
      )}
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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  identityCopy: { flex: 1, gap: 2 },
  name: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  role: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
  identityMeta: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  group: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    shadowColor: colors.deepCharcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  groupTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: spacing[2],
    paddingTop: spacing[1],
  },
  groupRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.coolConcrete,
  },
  groupCopy: { flex: 1, gap: 2 },
  groupValue: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
  },
  rowIcon: { width: 24, alignItems: 'center', justifyContent: 'center' },
  rowLabel: {
    flex: 1,
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
});
