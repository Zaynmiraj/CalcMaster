import { useContext, useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import { SplashScreen } from 'expo-router';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { StatusBar } from 'expo-status-bar';

import { initializeAdMob } from '@/utils/adMobService';
import { AuthProvider } from '@/context/AuthContext';
import {
  registerBackgroundMessageHandler,
  initializePushNotifications,
} from '@/utils/notificationService';

// Register background FCM handler early outside of component tree
registerBackgroundMessageHandler();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [fontsLoaded, fontError] = useFonts({
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,
  });

  useEffect(() => {
    initializeAdMob();
    const pushCleanupPromise = initializePushNotifications();
    return () => {
      pushCleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
          </Stack>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
