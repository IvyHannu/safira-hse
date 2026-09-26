import { useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import Buildings from 'phosphor-react-native/src/icons/Buildings';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';
import Globe from 'phosphor-react-native/src/icons/Globe';
import IdentificationCard from 'phosphor-react-native/src/icons/IdentificationCard';
import MapPin from 'phosphor-react-native/src/icons/MapPin';
import Question from 'phosphor-react-native/src/icons/Question';
import SignOut from 'phosphor-react-native/src/icons/SignOut';
import TextAa from 'phosphor-react-native/src/icons/TextAa';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ValidationMessage, WorkerHeader } from '@/components/ui';
import { WorkspaceSelector } from '@/components/workspace-selector';
import { workerHomeDemo } from '@/demo/worker-data';
import { useAuth } from '@/lib/demo-auth';

function ProfileActionRow({
  label,
  icon,
  detail,
  onPress,
  critical = false,
}: {
  label: string;
  icon: ReactNode;
  detail?: string;
  onPress(): void;
  critical?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.actionRow,
        hovered && styles.actionHover,
        pressed && styles.actionPressed,
      ]}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={[styles.rowLabel, critical && styles.criticalText]}>
        {label}
      </Text>
      {detail && <Text style={styles.rowDetail}>{detail}</Text>}
      {!critical && <CaretRight size={17} color={colors.graphite} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session, loading, error, signOut } = useAuth();
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
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
            <View
              style={styles.avatar}
              accessibilityLabel={`${workerHomeDemo.worker.firstName} avatar`}
            >
              <Text style={styles.avatarText}>
                {workerHomeDemo.worker.firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.name}>{workerHomeDemo.worker.firstName}</Text>
              <Text style={styles.role}>Worker</Text>
              <Text style={styles.identityMeta}>Organisation</Text>
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
                <ProfileActionRow
                  label="Personal details"
                  icon={
                    <IdentificationCard size={20} color={colors.graphite} />
                  }
                  onPress={() =>
                    setInfoMessage('Personal details are not available yet.')
                  }
                />
                <ProfileActionRow
                  label="Accessibility"
                  icon={<TextAa size={20} color={colors.graphite} />}
                  onPress={() =>
                    setInfoMessage(
                      'Accessibility settings are not available yet.',
                    )
                  }
                />
                <ProfileActionRow
                  label="Language"
                  icon={<Globe size={20} color={colors.graphite} />}
                  detail="English"
                  onPress={() =>
                    setInfoMessage('Language settings are not available yet.')
                  }
                />
              </View>

              <View style={styles.group}>
                <ProfileActionRow
                  label="Help & Support"
                  icon={<Question size={20} color={colors.graphite} />}
                  onPress={() =>
                    setInfoMessage('Help & Support is not available yet.')
                  }
                />
              </View>

              <View style={styles.group}>
                <ProfileActionRow
                  label="Sign out"
                  icon={<SignOut size={20} color={colors.critical} />}
                  critical
                  onPress={() => {
                    setInfoMessage(null);
                    void signOut().then(() => router.replace('/'));
                  }}
                />
              </View>
            </>
          )}

          <ValidationMessage message={error || undefined} />
          {infoMessage && (
            <Text accessibilityLiveRegion="polite" style={styles.infoMessage}>
              {infoMessage}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch workspace"
            onPress={() => setSwitchingWorkspace(true)}
            style={({ pressed }) => [
              styles.devToggle,
              pressed && styles.actionPressed,
            ]}
          >
            <Text style={styles.devText}>Switch workspace</Text>
            <CaretRight size={16} color={colors.graphite} />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[1], paddingBottom: spacing[2] },
  title: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: colors.coolConcrete,
  },
  avatarText: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '700',
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
  rowDetail: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
  },
  actionRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.coolConcrete,
  },
  actionHover: { backgroundColor: colors.coolSurface },
  actionPressed: { backgroundColor: colors.coolConcrete },
  criticalText: { color: colors.critical },
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
  infoMessage: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  devToggle: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[1],
  },
  devText: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
});
