import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  SchibstedGrotesk_500Medium,
  SchibstedGrotesk_600SemiBold,
  SchibstedGrotesk_700Bold,
  SchibstedGrotesk_800ExtraBold,
} from '@expo-google-fonts/schibsted-grotesk';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { AppStateProvider, useApp } from '../src/data/AppState';
import { ThemeProvider, useIsDark, useTheme } from '../src/theme';

// Applies the golfer's appearance preference (System / Light / Dark) app-wide.
function Themed({ children }: { children: React.ReactNode }) {
  const { golfer } = useApp();
  return <ThemeProvider mode={golfer.themeMode ?? 'system'}>{children}</ThemeProvider>;
}

function Shell() {
  const { hydrated } = useApp();
  const t = useTheme();
  const dark = useIsDark();
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: t.canvas }} />;
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.canvas } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="round/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="round/[id]/index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="round/[id]/scorecard" />
        <Stack.Screen name="round/[id]/summary" />
        <Stack.Screen name="course/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SchibstedGrotesk_500Medium, SchibstedGrotesk_600SemiBold, SchibstedGrotesk_700Bold, SchibstedGrotesk_800ExtraBold,
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold,
  });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#f3f3f3' }} />;
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <Themed>
          <Shell />
        </Themed>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
