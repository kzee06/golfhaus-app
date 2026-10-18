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
import { useIsDark, useTheme } from '../src/theme';

function Gate({ children }: { children: React.ReactNode }) {
  const { hydrated } = useApp();
  const t = useTheme();
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: t.canvas }} />;
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SchibstedGrotesk_500Medium, SchibstedGrotesk_600SemiBold, SchibstedGrotesk_700Bold, SchibstedGrotesk_800ExtraBold,
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold,
  });
  const dark = useIsDark();
  const t = useTheme();
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: t.canvas }} />;
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Gate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.canvas } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="round/new" options={{ presentation: 'modal' }} />
            <Stack.Screen name="round/[id]/index" options={{ gestureEnabled: false }} />
            <Stack.Screen name="round/[id]/scorecard" />
            <Stack.Screen name="round/[id]/summary" />
            <Stack.Screen name="course/[id]" />
          </Stack>
        </Gate>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
