import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ConfigMissing } from '@/components/auth/config-missing';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(app)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AuthProvider>
          <RootShell />
        </AuthProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

function RootShell() {
  const { isReady, configError } = useAuth();
  const colorScheme = useColorScheme();

  if (!isReady) {
    if (Platform.OS !== 'web') {
      return null;
    }

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#208AEF' }}>
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {configError ? <ConfigMissing message={configError} /> : <RootNavigator />}
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Protected guard={user != null}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={user == null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
