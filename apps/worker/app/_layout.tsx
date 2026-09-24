import '../global.css';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { DemoAuthProvider } from '@/lib/demo-auth';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter: Inter_400Regular });
  if (!fontsLoaded) return null;
  return (
    <DemoAuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DemoAuthProvider>
  );
}
