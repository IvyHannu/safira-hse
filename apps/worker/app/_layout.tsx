import '../global.css';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { WorkerLaunchSplash } from '@/components/ui/launch-splash';
import { DemoAuthProvider, useAuth } from '@/lib/demo-auth';
import { ProfilePhotoProvider } from '@/profile/photo-provider';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter: Inter_400Regular });
  return (
    <DemoAuthProvider>
      <ProfilePhotoProvider>
        <WorkerAppShell fontsLoaded={fontsLoaded} />
      </ProfilePhotoProvider>
    </DemoAuthProvider>
  );
}

function WorkerAppShell({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { loading } = useAuth();
  const [brandReady, setBrandReady] = useState(false);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  const finishSplash = useCallback(() => setSplashFinished(true), []);
  useEffect(() => {
    if (!brandReady) return;
    const timer = setTimeout(() => setMinimumElapsed(true), 3500);
    return () => clearTimeout(timer);
  }, [brandReady]);
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {!splashFinished && (
        <WorkerLaunchSplash
          onBrandReady={() => setBrandReady(true)}
          readyToFinish={fontsLoaded && !loading && minimumElapsed}
          onFinished={finishSplash}
        />
      )}
    </View>
  );
}
