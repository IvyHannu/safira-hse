import { Redirect, useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import Globe from 'phosphor-react-native/src/icons/Globe';
import IdentificationCard from 'phosphor-react-native/src/icons/IdentificationCard';
import Question from 'phosphor-react-native/src/icons/Question';
import TextAa from 'phosphor-react-native/src/icons/TextAa';
import { StyleSheet, Text, View } from 'react-native';
import {
  SettingsRow,
  SignOutButton,
  ProfilePhotoEditor,
  ValidationMessage,
} from '@/components/ui';
import { workerHomeDemo } from '@/demo/worker-data';
import { useAuth } from '@/lib/demo-auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { account, session, loading, error, signOut } = useAuth();

  if (!loading && (!session || session.role !== 'worker'))
    return <Redirect href="/sign-in" />;

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Profile</Text>

      {loading ? (
        <Text style={styles.body}>Opening your profile…</Text>
      ) : (
        <>
          <View style={styles.identity}>
            <ProfilePhotoEditor name={account?.fullName || workerHomeDemo.worker.firstName} />
            <View style={styles.identityCopy}>
              <Text style={styles.name}>{account?.fullName || workerHomeDemo.worker.firstName}</Text>
              <Text style={styles.role}>Worker</Text>
              <Text style={styles.identityMeta}>
                Current site · {account?.site || workerHomeDemo.site.name}
              </Text>
            </View>
          </View>

          {session?.role === 'worker' && (
            <>
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
                    void signOut().then(() => router.replace('/sign-in'));
                  }}
                />
              </View>
            </>
          )}

          <ValidationMessage message={error || undefined} />
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
  body: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
  },
});
