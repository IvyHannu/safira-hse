import { usePathname, useRouter } from 'expo-router';
import House from 'phosphor-react-native/src/icons/House';
import Files from 'phosphor-react-native/src/icons/Files';
import Plus from 'phosphor-react-native/src/icons/Plus';
import ShieldCheck from 'phosphor-react-native/src/icons/ShieldCheck';
import UserCircle from 'phosphor-react-native/src/icons/UserCircle';
import { colors } from '@safira/design-tokens';
import { StyleSheet, View } from 'react-native';
import { WorkerBottomNav, type BottomNavigationItem } from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';

export function WorkerNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useAuth();
  const selectedKey = pathname.startsWith('/reports')
    ? 'reports'
    : pathname.startsWith('/report')
      ? 'report'
      : pathname.startsWith('/safety')
        ? 'safety'
        : pathname.startsWith('/profile')
          ? 'profile'
          : 'home';
  const items: BottomNavigationItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: (
        <House
          size={21}
          color={selectedKey === 'home' ? colors.white : colors.graphite}
          weight={selectedKey === 'home' ? 'fill' : 'regular'}
        />
      ),
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: (
        <Files
          size={21}
          color={selectedKey === 'reports' ? colors.white : colors.graphite}
          weight={selectedKey === 'reports' ? 'fill' : 'regular'}
        />
      ),
    },
    {
      key: 'report',
      label: 'Report',
      icon: (
        <View style={styles.reportIcon}>
          <Plus size={24} weight="bold" color={colors.deepCharcoal} />
        </View>
      ),
      disabled: loading || session?.role !== 'worker',
    },
    {
      key: 'safety',
      label: 'Safety',
      icon: (
        <ShieldCheck
          size={21}
          color={selectedKey === 'safety' ? colors.white : colors.graphite}
          weight={selectedKey === 'safety' ? 'fill' : 'regular'}
        />
      ),
      disabled: loading || session?.role !== 'worker',
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: (
        <UserCircle
          size={21}
          color={selectedKey === 'profile' ? colors.white : colors.graphite}
          weight={selectedKey === 'profile' ? 'fill' : 'regular'}
        />
      ),
    },
  ];

  function select(key: string) {
    if (key === 'home') router.replace('/');
    if (key === 'reports') router.push('/reports');
    if (key === 'report') router.push('/report');
    if (key === 'safety') router.push('/safety');
    if (key === 'profile') router.push('/profile');
  }

  return (
    <WorkerBottomNav
      items={items}
      selectedKey={selectedKey}
      onSelect={select}
    />
  );
}

const styles = StyleSheet.create({
  reportIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.signalYellow,
    borderWidth: 1,
    borderColor: colors.deepCharcoal,
  },
});
