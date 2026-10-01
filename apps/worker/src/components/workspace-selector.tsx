import { useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import type { AuthRole } from '@safira/auth';
import { colors, radius, spacing, typography } from '@safira/design-tokens';
import Buildings from 'phosphor-react-native/src/icons/Buildings';
import CaretRight from 'phosphor-react-native/src/icons/CaretRight';
import ClipboardText from 'phosphor-react-native/src/icons/ClipboardText';
import ShieldCheck from 'phosphor-react-native/src/icons/ShieldCheck';
import UsersThree from 'phosphor-react-native/src/icons/UsersThree';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SignOutButton, ValidationMessage } from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';

const fullLogo = require('../../../../docs/references/brand/Safira Logo Full.png');

const workspaces: readonly {
  role: AuthRole;
  label: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    role: 'worker',
    label: 'Worker',
    description: 'Report issues, follow updates and complete safety checks',
    icon: <ClipboardText size={22} color={colors.deepCharcoal} />,
  },
  {
    role: 'hse_officer',
    label: 'HSE Officer',
    description: 'Review reports, assess risk and manage actions',
    icon: <ShieldCheck size={22} color={colors.deepCharcoal} />,
  },
  {
    role: 'hse_admin',
    label: 'HSE Admin',
    description: 'Manage HSE operations, configuration and oversight',
    icon: <Buildings size={22} color={colors.deepCharcoal} />,
  },
  {
    role: 'organisation_admin',
    label: 'Organisation Admin',
    description: 'Manage people, sites and organisation access',
    icon: <UsersThree size={22} color={colors.deepCharcoal} />,
  },
];

function WorkspaceRow({
  label,
  description,
  icon,
  onPress,
}: {
  label: string;
  description: string;
  icon: ReactNode;
  onPress(): void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${description}`}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.row,
        hovered && styles.rowHover,
        pressed && styles.rowPressed,
        focused && styles.rowFocused,
      ]}
    >
      <View style={styles.icon}>{icon}</View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <CaretRight size={20} color={colors.graphite} />
    </Pressable>
  );
}

export function WorkspaceSelector() {
  const router = useRouter();
  const { signIn, signOut, error } = useAuth();
  const [routeError, setRouteError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const wide = width >= 800;

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
      if (Platform.OS === 'web') window.location.assign(destination);
      else await Linking.openURL(destination);
    } catch {
      setRouteError('Could not open the selected workspace. Try again.');
    }
  }

  return (
    <View style={[styles.content, wide && styles.contentWide]}>
      <View style={[styles.brandPanel, wide && styles.brandPanelWide]}>
        <Image
          source={fullLogo}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Safira"
        />
        <View style={[styles.brandMessage, wide && styles.brandMessageWide]}>
          <Text style={styles.brandTitle}>
            Safer reporting.{'\n'}Clearer action.
          </Text>
          <Text style={styles.brandDescription}>
            See it. Report it. Know what happened next.
          </Text>
        </View>
      </View>
      <View style={[styles.selectionPanel, wide && styles.selectionPanelWide]}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>WELCOME TO SAFIRA</Text>
          <Text style={styles.title}>Choose your workspace</Text>
          <Text style={styles.guidance}>
            Continue as the role that matches your work.
          </Text>
        </View>
        <View style={styles.roles}>
          {workspaces.map(({ role, label, description, icon }) => (
            <WorkspaceRow
              key={role}
              label={label}
              description={description}
              icon={icon}
              onPress={() => void chooseWorkspace(role)}
            />
          ))}
          <View style={styles.signOut}>
            <SignOutButton onPress={() => void signOut()} />
          </View>
        </View>
        <ValidationMessage message={routeError || error || undefined} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
    backgroundColor: colors.coolSurface,
  },
  contentWide: {
    maxWidth: 1200,
    minHeight: 680,
    flexGrow: 0,
    flexDirection: 'row',
    marginVertical: spacing[4],
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  brandPanel: {
    minHeight: 270,
    backgroundColor: '#121412',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    gap: spacing[4],
  },
  brandPanelWide: { width: '42%', padding: spacing[5] },
  logo: { width: 120, height: 120 },
  brandMessage: {
    borderLeftWidth: 5,
    borderLeftColor: colors.signalYellow,
    paddingLeft: spacing[2],
    gap: spacing[2],
  },
  brandMessageWide: { marginVertical: 'auto' },
  brandTitle: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  brandDescription: {
    color: colors.coolConcrete,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  selectionPanel: {
    padding: spacing[3],
    gap: spacing[3],
    justifyContent: 'center',
  },
  selectionPanelWide: { width: '58%', padding: spacing[5] },
  heading: {
    gap: spacing[1],
  },
  eyebrow: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  title: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  guidance: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    lineHeight: 22,
  },
  roles: { gap: spacing[2] },
  signOut: { alignSelf: 'flex-start', marginTop: spacing[1] },
  row: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.coolConcrete,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    shadowColor: colors.deepCharcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },
  rowHover: {
    borderColor: colors.signalYellow,
    backgroundColor: colors.coolSurface,
    shadowOpacity: 0.12,
  },
  rowPressed: {
    borderColor: colors.signalYellow,
    backgroundColor: `${colors.signalYellow}18`,
    transform: [{ scale: 0.99 }],
  },
  rowFocused: { borderWidth: 2, borderColor: colors.signalYellow },
  icon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.signalYellow,
  },
  rowCopy: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: {
    color: colors.deepCharcoal,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  rowDescription: {
    color: colors.graphite,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
});
