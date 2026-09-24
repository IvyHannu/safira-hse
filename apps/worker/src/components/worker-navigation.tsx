import { usePathname, useRouter } from 'expo-router';
import House from 'phosphor-react-native/src/icons/House';
import Files from 'phosphor-react-native/src/icons/Files';
import PlusCircle from 'phosphor-react-native/src/icons/PlusCircle';
import ShieldCheck from 'phosphor-react-native/src/icons/ShieldCheck';
import UserCircle from 'phosphor-react-native/src/icons/UserCircle';
import { colors } from '@safira/design-tokens';
import {
  BottomNavigationShell,
  type BottomNavigationItem,
} from '@/components/ui';
import { useAuth } from '@/lib/demo-auth';

export function WorkerNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useAuth();
  const selectedKey = pathname.startsWith('/report')
    ? 'report'
    : pathname === '/profile'
      ? 'profile'
      : 'home';
  const items: BottomNavigationItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: <House size={24} color={colors.graphite} />,
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: <Files size={24} color={colors.graphite} />,
      disabled: true,
    },
    {
      key: 'report',
      label: 'Report',
      icon: <PlusCircle size={24} color={colors.graphite} />,
      disabled: loading || session?.role !== 'worker',
    },
    {
      key: 'safety',
      label: 'Safety',
      icon: <ShieldCheck size={24} color={colors.graphite} />,
      disabled: true,
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserCircle size={24} color={colors.graphite} />,
    },
  ];

  function select(key: string) {
    if (key === 'home') router.replace('/');
    if (key === 'report') router.push('/report');
    if (key === 'profile') router.push('/profile');
  }

  return (
    <BottomNavigationShell
      items={items}
      selectedKey={selectedKey}
      onSelect={select}
    />
  );
}
